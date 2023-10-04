import { init_carrier_behavior, init_worker_behavior } from "@/role/initializer/config.behavior"
import { publish_spawn_task } from "@/structure/lv1_spawn"
import { change_reaction } from "@/structure/lv6_lab"

export const create_controller_room = function(room_name:string,task_type:RoomLoopType) {
    const _room_loops = Memory._loop_room[room_name] ?? (Memory._loop_room[room_name] = {})
    _room_loops[task_type] = {
        reload_time: 0,
        interval: 1500
    }
}
_.assign(global, {create_controller_room:create_controller_room})

export const loop_rooms = function(){
    for(let room_name in Memory._loop_room) {
        const _room_loops = Memory._loop_room[room_name]
        const room = Game.rooms[room_name]
        if(!_room_loops || !room) continue
        let task_type: RoomLoopType
        for(task_type in _room_loops){
            const _loop = _room_loops[task_type]
            if(!_loop || _loop.reload_time > Game.time) continue
            /**限定时间间隔，防止无限生爬 */
            if(_loop.interval < 200) _loop.interval = 200
            if(_loop.interval > 10000) _loop.interval = 10000
            /**重置定时器 */
            _loop.reload_time = Game.time + _loop.interval

            console.log(`_loop\t${room_name}\t${task_type}`)
            let spawn_task: SpawnTask<RoomLoopType>|null = null
            if(room) spawn_task = handlers[task_type](room)
            if(spawn_task){
                publish_spawn_task(spawn_task)
            }
            /**每tick只扫描一次，减少cpu负载波动 */
            return
        }
    }
}

const handlers: {
    [T in RoomLoopType] : (room: Room) => SpawnTask<T>|null
} = {
    _collect: function (room: Room) {
        const caller: SpawnCaller<'_collect'> = {
            dest_room: room.name,
            loop_type: '_loop_room',
            task_type: '_collect',
            loop_key: room.name
        }
        if (!room.storage?.my) {
            return {
                _body: { generator: 'C', workload: 16 },
                _class: init_worker_behavior('EnergySupplier', room.name, room.name),
                _caller: caller
            }
        }
        return {
            _body: { generator: 'C', workload: 16 },
            _class: init_carrier_behavior('Collector', room.name, room.name),
            _caller: caller
        }
    },

    _supply: function (room: Room) {
        const caller: SpawnCaller<'_supply'> = {
            dest_room: room.name,
            loop_type: '_loop_room',
            task_type: '_supply',
            loop_key: room.name
        }
        if (!room.storage?.my) {
            return {
                _body: { generator: 'C', workload: 16 },
                _class: init_worker_behavior('EnergySupplier', room.name, room.name),
                _caller: caller
            }
        }
        return {
            _body: { generator: 'C', workload: 16 },
            _class: init_carrier_behavior('Supplier', room.name, room.name),
            _caller: caller
        }
    },

    _build: function (room: Room) {
        let workload = room.find(FIND_MY_CONSTRUCTION_SITES).length
        if (!workload) return null
        const caller: SpawnCaller<'_build'> = {
            dest_room: room.name,
            loop_type: '_loop_room',
            task_type: '_build',
            loop_key: room.name
        }
        if (room.storage && room.controller) {
            if (room.storage.store.energy < room.controller.level * 10000)
                return null
        }
        return {
            _body: { generator: 'WC', workload: 12 },
            _class: init_worker_behavior('Builder', room.name, room.name),
            _caller: caller
        }
    },

    _maintain: function (room: Room) {
        const decayed = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType == STRUCTURE_ROAD
                    || structure.structureType == STRUCTURE_CONTAINER)
                    return structure.hits < structure.hitsMax * 0.5
                return false
            }
        })
        if (!decayed.length)
            return null
        const caller: SpawnCaller<'_maintain'> = {
            dest_room: room.name,
            loop_type: '_loop_room',
            task_type: '_maintain',
            loop_key: room.name
        }
        return {
            _body: { generator: 'WC', workload: 8 },
            _class: init_worker_behavior('Maintainer', room.name, room.name),
            _caller: caller
        }
    },
    _fortify: function (room: Room) {
        const caller: SpawnCaller<'_fortify'> = {
            dest_room: room.name,
            loop_type: '_loop_room',
            task_type: '_fortify',
            loop_key: room.name
        }
        if (room.storage && room.controller) {
            if (room.storage.store.energy < room.controller.level * 20000)
                return null
        }
        return {
            _body: { generator: 'WC', workload: 32 },
            _class: init_worker_behavior('Builder', room.name, room.name),
            _caller: caller
        }
    },
    _chemist: function (room: Room) {
        change_reaction(room)
        const caller: SpawnCaller<'_chemist'> = {
            dest_room: room.name,
            loop_type: '_loop_room',
            task_type: '_chemist',
            loop_key: room.name
        }
        if (!room.terminal?.my) {
            return null
        }
        return {
            _body: { generator: 'C', workload: 16 },
            _class: init_carrier_behavior('Chemist', room.name, room.name),
            _caller: caller
        }
    }
}

const Observe = function (room: Room, looper: Looper) {
    //structure_updater.labs(room, room.memory._struct)
    Memory._closest_owned[room.name] = {
        root:   room.name,
        prev:   room.name,
        dist:   0,
        time:   Game.time
    }
    //room.memory.observer.BFS_open = [room.name]
    looper.interval = 400
    return null
}

const containers = function (room:Room) {
    const containers:StructureContainer[] = room.find(FIND_STRUCTURES,{
        filter: {structureType: STRUCTURE_CONTAINER}
    });
    const task: StaticMemory = {
        bhvr_name:  'static',
        state:      'collect',
        collect:    [],
        consume:    []
    }
    for(let container of containers){
        if(container.pos.findInRange(FIND_SOURCES,2).length){
            task.collect.push({
                action: 'withdraw',
                args: [container.id,'energy'],
                pos: container.pos
            })
        } else {
            const mineral = container.pos.findInRange(FIND_MINERALS,2)
            if(mineral[0]) {
                task.collect.push({
                    action: 'withdraw',
                    args: [container.id,mineral[0].mineralType],
                    pos: container.pos
                })
            } else {
                task.consume.push({
                    action: 'transfer',
                    args: [container.id,'energy'],
                    pos: container.pos
                })
            }
        }
    }
}
const Fortify = function (room: Room, looper: Looper) {
    const storage = room.storage
    looper.interval = 1500
    if (room.controller?.level != 8 && !room.find(FIND_MY_CONSTRUCTION_SITES).length)
        return null
    if(Game.cpu.bucket < 9950)
        return null
    if (storage && storage.store.energy <= 80000)
        return null
    if (room.memory.wall_hits && room.memory.wall_hits > 50000000){
        return null
    }
    return {
        _body: { generator: 'WC', workload: 32 },
        _class: init_worker_behavior('Builder', room.name, room.name)
    }
}