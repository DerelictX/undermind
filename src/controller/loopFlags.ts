import {publish_spawn_task} from "@/structure/lv1_spawn"
import {parse_posed_task, TASK_COMPLETE, TASK_DOING} from "@/performer/behavior.callback";
import {init_carrier_behavior, init_worker_behavior} from "@/role/initializer/config.behavior";
import {createHarvestRoad} from "@/move/roomCallback";

export const loop_flags = function (flag: Flag) {
    const _loop = flag.memory._loop
    if (!_loop || _loop._time > Game.time) return;
    /**限定时间间隔，防止无限生爬 */
    if (_loop.interval < 200) _loop.interval = 200
    if (_loop.interval > 10000) _loop.interval = 10000
    /**重置定时器 */
    _loop._time = Game.time + _loop.interval

    console.log(`_loop\t${flag.name}\t${_loop._loop_type}`)
    let spawn_tasks: SpawnTask[] = handlers[_loop._loop_type](flag)
    for (const task of spawn_tasks) {
        publish_spawn_task({...task, _caller: flag.name})
    }
}

const handlers: {
    [T in AnyLoopType]: (flag: Flag) => SpawnTask[]
} = {
    _build(flag: Flag): SpawnTask[] {
        const room = flag.room
        if (!room) return []
        let workload = room.find(FIND_MY_CONSTRUCTION_SITES).length
        if (!workload) return []

        if (room.storage && room.controller) {
            if (room.storage.store.energy < room.controller.level * 10000)
                return []
        }
        return [{
            _body: {generator: 'WC', workload: 12},
            _class: init_worker_behavior('Builder', room.name, room.name)
        }]
    }, _chemist(flag: Flag): SpawnTask[] {
        const room = flag.room
        if (!room?.terminal?.my) return []
        //change_reaction(room)
        return [{
            _body: {generator: 'C', workload: 16},
            _class: init_carrier_behavior('Chemist', room.name, room.name)
        }]
    }, _collect(flag: Flag): SpawnTask[] {
        const room_name = flag.pos.roomName
        const room = flag.room
        if (!room?.terminal?.my) {
            return [{
                _body: {generator: 'C', workload: 16},
                _class: init_worker_behavior('EnergySupplier', room_name, room_name)
            }]
        }
        return [{
            _body: {generator: 'C', workload: 16},
            _class: init_carrier_behavior('Collector', room.name, room.name)
        }]
    }, _deposit: function (flag: Flag): SpawnTask[] {
        if (Game.shard.name == 'shard3' && Game.cpu.bucket < 9950) return []
        const deposits = flag.room?.find(FIND_DEPOSITS)
        if (!deposits?.length) return []

        const _near = Memory._near_owned[flag.pos.roomName]
        if (!_near) return []
        const store_room = Object.keys(_near)[0]
        if (!store_room) return []
        const storage = Game.rooms[store_room]?.storage
        const deposit_type = deposits[0].depositType
        if (!storage?.my || storage.store[deposit_type] > 10000) return []

        const task: StaticMemory = {
            bhvr_name: "static",
            state: "collect",
            collect: [],
            consume: [parse_posed_task({
                action: 'transfer', args: [storage.id, deposit_type], pos: storage.pos
            })],
        }
        for (let deposit of deposits) {
            if (!deposit.room || deposit.lastCooldown > 50) continue
            task.collect.push({
                action: 'harvest', args: [deposit.id], pos: deposit.pos,
                //过道挖一下换一个
                [ERR_TIRED]: TASK_DOING, [ERR_NOT_IN_RANGE]: TASK_DOING, [OK]: TASK_COMPLETE
            })
        }
        if (!task.collect.length) return []

        console.log(store_room + ' -> Deposit:\t' + flag.name)
        return [{_body: {generator: 'DH', workload: 15, mobility: 1}, _class: task}]
    }, _fortify(flag: Flag): SpawnTask[] {
        const room = flag.room
        if (!room || Game.shard.name == 'shard3' && Game.cpu.bucket < 9950) return []
        if (room.storage && room.controller) {
            if (room.storage.store.energy < room.controller.level * 20000)
                return []
        }
        const storage = room.storage
        if (storage?.my && storage.store['XLH2O'] >= 3000) {
            return [{
                _body: {generator: 'WC', workload: 32, boost: {work: 'XLH2O'}},
                _class: init_worker_behavior('Builder', room.name, room.name)
            }]
        }
        return [{
            _body: {generator: 'WC', workload: 32},
            _class: init_worker_behavior('Builder', room.name, room.name)
        }]
    }, _maintain(flag: Flag): SpawnTask[] {
        const room = flag.room
        if (!room) return []
        const decayed = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType == STRUCTURE_ROAD
                    || structure.structureType == STRUCTURE_CONTAINER)
                    return structure.hits < structure.hitsMax * 0.5
                return false
            }
        })
        if (!decayed.length) return []
        return [{
            _body: {generator: 'WC', workload: 8},
            _class: init_worker_behavior('Maintainer', room.name, room.name)
        }]
    }, _mineral: function (flag: Flag): SpawnTask[] {
        const mineral = flag.pos.lookFor(LOOK_MINERALS)[0]
        if (!mineral) return []
        const task: StaticMemory = {
            bhvr_name: "static",
            state: "collect",
            collect: [{action: 'harvest', args: [mineral.id], pos: mineral.pos}],
            consume: [],
        }
        const extractor: StructureExtractor | null = mineral.pos.findClosestByRange(FIND_MY_STRUCTURES,
            {filter: {structureType: STRUCTURE_EXTRACTOR}})
        if (!extractor || !mineral.room || !mineral.mineralAmount)
            return []
        const container: StructureContainer | null = mineral.pos.findClosestByRange(FIND_STRUCTURES,
            {filter: {structureType: STRUCTURE_CONTAINER}})
        if (!container || !container.pos.isNearTo(mineral) || container.store.getFreeCapacity() == 0)
            return []
        //const store_room = Memory._closest_owned[mineral.room.name]?.root
        const store_room = mineral.room.name
        const storage = Game.rooms[store_room]?.storage
        if (!storage?.my || storage.store[mineral.mineralType] > 30000)
            return []
        task.consume.push({action: 'transfer', args: [container.id, mineral.mineralType], pos: container.pos})
        //spawn
        return [{_body: {generator: 'Wc', workload: 25}, _class: task}]
    }, _observe: function (flag: Flag) {
        const room_name = flag.pos.roomName
        const _near = Memory._near_owned[room_name] ?? (Memory._near_owned[room_name] = {})
        _near[room_name] = {
            prev: room_name,
            dist: 0,
            time: Game.time
        }
        const config = flag.room?.memory.observer
        if (config) {
            config.start_time = Game.time
            config.BFS_open = [room_name]
        }
        return []
    }, _reserve: function (flag: Flag): SpawnTask[] {
        const controller = flag.room?.controller
        const reservation = controller?.reservation
        if (!controller || reservation && reservation.username == Memory.username && reservation.ticksToEnd > 3000)
            return []
        const reserve: CallbackBehavior<'reserveController'> = {
            action: 'reserveController', args: [controller.id], pos: controller.pos
        }
        const attack: CallbackBehavior<'attackController'> = {
            action: 'attackController', args: [controller.id], pos: controller.pos
        }
        const bhvr: StaticMemory = {
            bhvr_name: "static",
            state: "collect",
            collect: [reserve, attack],
            consume: [],
        }
        return [{_body: {generator: 'Cl', workload: 4, mobility: 1}, _class: bhvr}]
    }, _source: function (flag: Flag): SpawnTask[] {
        const source = flag.pos.lookFor(LOOK_SOURCES)[0]
        if (!source) return []
        const task: StaticMemory = {
            bhvr_name: "static",
            state: "collect",
            collect: [{action: 'harvest', args: [source.id], pos: source.pos}],
            consume: [],
        }
        const sites = source.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2)
        sites.forEach(s => task.consume.push({action: 'build', args: [s.id], pos: s.pos}))
        const near_structs: AnyStoreStructure[] = source.pos.findInRange(FIND_STRUCTURES, 2, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER
                    || structure.structureType == STRUCTURE_STORAGE
                    || structure.structureType == STRUCTURE_TERMINAL
                    || structure.structureType == STRUCTURE_LINK
            }
        })
        near_structs.sort((a, b) => {
            return a.store.getCapacity('energy') - b.store.getCapacity('energy')
                - a.pos.getRangeTo(source) + b.pos.getRangeTo(source)
        })
        for (let struct of near_structs) {
            task.consume.push({action: 'repair', args: [struct.id], pos: struct.pos})
            task.consume.push({action: 'transfer', args: [struct.id, 'energy'], pos: struct.pos})
        }
        //spawn
        if (!task.consume[0]) {
            const fromPos = source.room.storage?.pos ?? source.room.controller?.pos
            if (fromPos && Game.shard.name != 'shard3') createHarvestRoad(fromPos, source.pos)
            return [{_body: {generator: 'W', workload: 5, mobility: 1}, _class: task}]
        }
        return [{_body: {generator: 'Wc', workload: 10}, _class: task}]
    }, _supply(flag: Flag): SpawnTask[] {
        const room_name = flag.pos.roomName
        const room = flag.room
        if (!room?.terminal?.my) {
            return [{
                _body: {generator: 'C', workload: 16},
                _class: init_worker_behavior('EnergySupplier', room_name, room_name)
            }]
        }
        return [{
            _body: {generator: 'C', workload: 16},
            _class: init_carrier_behavior('Supplier', room.name, room.name)
        }]
    }, _upgrade: function (flag: Flag): SpawnTask[] {
        const controller = flag.room?.controller
        if (!controller || Game.shard.name == 'shard3' && Game.cpu.bucket < 9950) return []
        const storage = controller.room.storage
        if (storage?.my && storage.store.energy <= 15000 * controller.level) return []
        const task: StaticMemory = {
            bhvr_name: 'static',
            state: 'collect',
            collect: [],
            consume: [{action: 'upgradeController', args: [controller.id], pos: controller.pos}]
        }

        const energy_structs: AnyStoreStructure[] = controller.pos.findInRange(FIND_STRUCTURES, 3, {
            filter: structure => structure.structureType == STRUCTURE_CONTAINER
                || structure.structureType == STRUCTURE_STORAGE
                || structure.structureType == STRUCTURE_TERMINAL
                || structure.structureType == STRUCTURE_LINK
        })
        if (!energy_structs.length) return []
        energy_structs.sort((a, b) => a.store.getCapacity('energy') - b.store.getCapacity('energy'))
        for (let struct of energy_structs) {
            task.collect.push({action: 'withdraw', args: [struct.id, 'energy'], pos: struct.pos})
        }

        let tasks: SpawnTask[] = [{_body: {generator: 'Wc', workload: 15}, _class: task}]
        if (storage?.my && storage.store['XGH2O'] >= 3000) {
            tasks[0]._body.boost = {work: 'XGH2O'}
        }
        if (energy_structs.length == 1 && energy_structs[0].structureType == STRUCTURE_CONTAINER) {
            tasks.push({
                _body: {generator: 'C', workload: 16},
                _class: init_worker_behavior('EnergySupplier', flag.pos.roomName, flag.pos.roomName)
            })
        }
        return tasks
    }, _feed(flag: Flag): SpawnTask[] {
        const pos = flag.pos
        const ret: StaticMemory = {
            bhvr_name: "static",
            state: "collect",
            collect: [],
            consume: [],
            buff_in: [],
            buff_out: []
        }

        const link: StructureLink[] = pos.findInRange(FIND_MY_STRUCTURES, 1, {
            filter: (structure) => structure.structureType == 'link'
        })
        link.forEach(s => ret.collect.push({
            action: 'withdraw', args: [s.id, 'energy'], pos: s.pos
        }))
        //填extension
        const extensions: (StructureSpawn | StructureExtension)[] = pos.findInRange(FIND_MY_STRUCTURES, 1, {
            filter: (structure) => structure.structureType == 'spawn'
                || structure.structureType == 'extension'
        })
        extensions.sort((a, b) => {
            return b.store.getCapacity('energy') - a.store.getCapacity('energy')
        })
        extensions.forEach(s => ret.consume.push({
            action: 'transfer', args: [s.id, 'energy'], pos: s.pos
        }))
        //container作为缓冲
        const container: StructureContainer[] = pos.findInRange(FIND_STRUCTURES, 1, {
            filter: (structure) => structure.structureType == 'container'
        })
        container.forEach(s => {
            ret.buff_in?.push({
                action: 'withdraw', args: [s.id, 'energy'], pos: s.pos
            })
            ret.buff_out?.push({
                action: 'transfer', args: [s.id, 'energy'], pos: s.pos
            })
        })
        return [];
    }, attack_squad(flag: Flag): SpawnTask[] {
        const _squad_id = flag.name + (Game.time % 10000)
        const size = 4
        Memory.squads[_squad_id] = {
            formation: 'snake',
            head_pos: flag.pos,
            member: [],
            offset_pos: 0,
            pending: true,
            size: size,
            target_pos: flag.pos
        }

        const tasks: SpawnTask[] = []
        for (let i = 0; i < size; ++i) {
            tasks.push({
                _body: {generator: (i & 1) ? 'R' : 'A', workload: 1},
                _class: {bhvr_name: 'fighter', slot: i, squad_id: _squad_id}
            })
        }
        return tasks
    }, _manual(flag: Flag): SpawnTask[] {
        return [{
            _body: {generator: 'WC', workload: 32, boost: {work: 'XLH2O'}},
            _class: {bhvr_name: "manual"}
        }]
    }
}

const containers = function (room: Room) {
    const containers: StructureContainer[] = room.find(FIND_STRUCTURES, {
        filter: {structureType: STRUCTURE_CONTAINER}
    });
    const task: StaticMemory = {
        bhvr_name: 'static',
        state: 'collect',
        collect: [],
        consume: []
    }
    for (let container of containers) {
        if (container.pos.findInRange(FIND_SOURCES, 2).length) {
            task.collect.push({
                action: 'withdraw',
                args: [container.id, 'energy'],
                pos: container.pos
            })
        } else {
            const mineral = container.pos.findInRange(FIND_MINERALS, 2)
            if (mineral[0]) {
                task.collect.push({
                    action: 'withdraw',
                    args: [container.id, mineral[0].mineralType],
                    pos: container.pos
                })
            } else {
                task.consume.push({
                    action: 'transfer',
                    args: [container.id, 'energy'],
                    pos: container.pos
                })
            }
        }
    }
}
