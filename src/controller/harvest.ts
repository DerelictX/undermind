export const create_controller = function(obj: Source|StructureController){
    if(Memory._loop_id[obj.id]) return
    if(obj instanceof Source) {
        Memory._loop_id[obj.id] = {
            dest_room: obj.room.name,
            task_type: '_source',
            loop_key: obj.id,
            reload_time: 0,
            interval: 1500
        }
    } else if(obj instanceof StructureController) {
        Memory._loop_id[obj.id] = {
            dest_room: obj.room.name,
            task_type: obj.my ? '_upgrade' : '_reserve',
            loop_key: obj.id,
            reload_time: 0,
            interval: 1500
        }
    }
}
_.assign(global, {create_controller:create_controller})

export const loopHarvest = function(){
    
    let id: keyof typeof Memory._loop_id
    for(id in Memory._loop_id){
        const _loop = Memory._loop_id[id]
        if(_loop.reload_time > Game.time) continue
        /**限定时间间隔，防止无限生爬 */
        if(_loop.interval < 200) _loop.interval = 200
        if(_loop.interval > 10000) _loop.interval = 10000
        /**重置定时器 */
        _loop.reload_time = Game.time + _loop.interval

        let spawn_task: SpawnTask|null = null
        switch(_loop.task_type){
            case '_source': {
                const obj = Game.getObjectById(_loop.loop_key)
                if(obj) spawn_task = handlers[_loop.task_type](obj); break;
            }
            case '_mineral': {
                const obj = Game.getObjectById(_loop.loop_key)
                if(obj) spawn_task = handlers[_loop.task_type](obj); break;
            }
            case '_deposit': {
                const obj = Game.getObjectById(_loop.loop_key)
                if(obj) spawn_task = handlers[_loop.task_type](obj); break;
            }
            case '_upgrade':
            case '_reserve': {
                const obj = Game.getObjectById(_loop.loop_key)
                if(obj) spawn_task = handlers[_loop.task_type](obj); break;
            }
            default:
                throw new Error("Unexpected _loop.task_type.")
        }
        if(spawn_task){
            //publish spawn task 
        }
        /**每tick只扫描一次，减少cpu负载波动 */
        return
    }
}

const handlers: {
    [T in GlobalLoopType] : (target: fromId<StaticPoolKeyTypeMap[T]>) => SpawnTask|null
} = {
    _source: function(source:Source) {
        const task: StaticMemory = {
            bhvr_name:  "static",
            state:      "collect",
            collect:    [{ action:'harvest', args:[source.id], pos:source.pos }],
            consume:    [],
        }
        const sites = source.pos.findInRange(FIND_MY_CONSTRUCTION_SITES,2)
        sites.forEach(s => task.consume.push({ action:'build', args:[s.id], pos:s.pos }))
        const near_structs:AnyStoreStructure[] = source.pos.findInRange(FIND_STRUCTURES,2,{
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
        for(let struct of near_structs){
            task.consume.push({ action:'repair', args:[struct.id], pos:struct.pos })
            task.consume.push({ action:'transfer', args:[struct.id,'energy'], pos:struct.pos })
        }
        //spawn
        const caller: SpawnCaller = {
            dest_room: source.pos.roomName,
            task_type: '_source',
            loop_key: source.id
        }
        if (!task.consume[0])
            return { _body: { generator: 'W', workload: 5, mobility: 1 }, _class: task, _caller: caller }
        return { _body: { generator: 'Wc', workload: 10 }, _class: task, _caller: caller }
    },

    _mineral: function(mineral:Mineral) {        
        const task: StaticMemory = {
            bhvr_name:  "static",
            state:      "collect",
            collect:    [{ action:'harvest', args:[mineral.id], pos:mineral.pos }],
            consume:    [],
        }
        const extractor:StructureExtractor|null = mineral.pos.findClosestByRange(FIND_MY_STRUCTURES,
                {filter: {structureType: STRUCTURE_EXTRACTOR}})
        if(!extractor || !mineral.room || !mineral.mineralAmount)
            return null
        const container:StructureContainer|null = mineral.pos.findClosestByRange(FIND_STRUCTURES,
                {filter: {structureType: STRUCTURE_CONTAINER}})
        if(!container || !container.pos.isNearTo(mineral) || container.store.getFreeCapacity() == 0)
            return null
        //const store_room = Memory._closest_owned[mineral.room.name]?.root
        const store_room = mineral.room.name
        const storage = Game.rooms[store_room]?.storage
        if (!storage?.my || storage.store[mineral.mineralType] > 30000)
            return null
        task.consume.push({ action:'transfer', args:[container.id, mineral.mineralType], pos:container.pos })
        //spawn
        const caller: SpawnCaller = {
            dest_room: mineral.pos.roomName,
            task_type: '_mineral',
            loop_key: mineral.id
        }
        return { _body: { generator: 'Wc', workload: 25 }, _class: task, _caller: caller }
    },

    _deposit: function(deposit:Deposit) {
        if(Game.cpu.bucket < 9950)
            return null
        const task: StaticMemory = {
            bhvr_name:  "static",
            state:      "collect",
            collect:    [{ action:'harvest', args:[deposit.id], pos:deposit.pos }],
            consume:    [],
        }
        if (!deposit.room || deposit.lastCooldown > 50)
            return null
        //const store_room = Memory._closest_owned[deposit.room.name]?.root
        const store_room = deposit.room.name
        const storage = Game.rooms[store_room]?.storage
        if (!storage?.my || storage.store[deposit.depositType] > 10000)
            return null
        task.consume.push({ action: 'transfer', args:[storage.id, deposit.depositType], pos:storage.pos })
        //spawn
        const workload = deposit.lastCooldown < 5 ? 15 : 20
        const caller: SpawnCaller = {
            dest_room: deposit.pos.roomName,
            task_type: '_deposit',
            loop_key: deposit.id
        }
        console.log(store_room + ' -> Deposit:\t' + deposit.pos)
        return { _body: { generator: 'DH', workload: workload, mobility: 1 }, _class: task, _caller: caller }
    },

    _upgrade: function(controller:StructureController){
        if(Game.cpu.bucket < 9950)
            return null
        const storage = controller.room.storage
        if (!storage?.my || storage.store.energy <= 20000 * controller.level)
            return null
        const task: StaticMemory = {
            bhvr_name:  'static',
            state:      'collect',
            collect:    [],
            consume:    [{ action:'upgradeController', args:[controller.id], pos:controller.pos }]
        }
        const energy_structs: AnyStoreStructure[] = controller.pos.findInRange(FIND_STRUCTURES,3,{
            filter: structure => structure.structureType == STRUCTURE_CONTAINER
                || structure.structureType == STRUCTURE_STORAGE
                || structure.structureType == STRUCTURE_TERMINAL
                || structure.structureType == STRUCTURE_LINK
        })
        if(!energy_structs.length) return null
        energy_structs.sort((a, b) => a.store.getCapacity('energy') - b.store.getCapacity('energy'))
        for(let struct of energy_structs){
            task.collect.push({action:'withdraw',args:[struct.id,'energy'],pos:struct.pos})
        }
        const caller: SpawnCaller = {
            dest_room: controller.pos.roomName,
            task_type: '_upgrade',
            loop_key: controller.id
        }
        return { _body: { generator: 'Wc', workload: 15 }, _class: task, _caller: caller }
    },

    _reserve: function(controller:StructureController){
        const reservation = controller.reservation
        if (reservation && reservation.username == Memory.username && reservation.ticksToEnd > 3000) {
            return null
        }
        const reserve: CallbackBehavior<'reserveController'> = {
            action: 'reserveController', args: [controller.id], pos: controller.pos
        }
        const attack: CallbackBehavior<'attackController'> = {
            action: 'attackController', args: [controller.id], pos: controller.pos
        }
        const bhvr: StaticMemory = {
            bhvr_name:  "static",
            state:      "collect",
            collect:    [reserve,attack],
            consume:    [],
        }
        const caller: SpawnCaller = {
            dest_room: controller.pos.roomName,
            task_type: '_reserve',
            loop_key: controller.id
        }
        return { _body: { generator: 'Cl', workload: 4, mobility: 1 }, _class: bhvr, _caller: caller }
    },
}

const Claim = function (room: Room, looper: Looper) {
    const controller = room.controller
    if (!controller || controller.my)
        return null
    const claim: CallbackBehavior<'claimController'> = {
        action: 'claimController',
        args: [controller.id],
        pos: controller.pos
    }
    const bhvr: StaticMemory = {
        bhvr_name:  "static",
        state:      "collect",
        collect:    [claim],
        consume:    [],
    }
    return {
        _body: { generator: 'Cl', workload: 1, mobility: 1 },
        _class: bhvr
    }
}