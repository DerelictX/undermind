import { find_store, find_transport } from "./task.finder"
import { _collect, _supply } from "./task.performer"

export const perform_collect = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'carrier')
        return
    
    if(creep.room.name != creep.memory.resource_room){
        creep.moveTo(new RoomPosition(25,25,creep.memory.resource_room))
        return
    }
    
    var ret_val:TaskReturnCode = 'idle'
    var task:TransportTask|null|undefined = creep.memory.class_memory.collect[0]
    if(task){
        ret_val = _collect(creep,task)
    }
        
    switch (ret_val) {
        case 'doing':
            return
        case 'idle':
            if(creep.memory.class_memory.supply[0]){
                creep.memory.class_memory.state = 'supply'
                return
            }
            if(creep.store.getUsedCapacity() > 0){
                find_store(creep)
                return
            }
            find_transport(creep)
            return

        case 'error':
            creep.memory.class_memory.collect.shift()
            return
        case 'done_one':
            creep.memory.class_memory.supply.push(task)
            creep.memory.class_memory.collect.shift()
            if(!creep.memory.class_memory.collect[0]){
                creep.memory.class_memory.state = 'supply'
            }
            return
        case 'done_all':
            creep.say('???')
            return
    }
}


export const perform_supply = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'carrier')
        return
    
    if(creep.room.name != creep.memory.target_room){
        creep.moveTo(new RoomPosition(25,25,creep.memory.target_room))
        return
    }
    var ret_val:TaskReturnCode = 'idle'
    var task:TransportTask|null|undefined = creep.memory.class_memory.supply[0]
    if(task){
        ret_val = _supply(creep,task)
    }

    switch (ret_val) {
        case 'doing':
            return
        case 'idle':
            creep.memory.class_memory.state = 'collect'
            return

        case 'error':
        case 'done_one':
            creep.memory.class_memory.supply.shift()
            if(!creep.memory.class_memory.supply[0]){
                creep.memory.class_memory.state = 'collect'
            }
            return
        case 'done_all':
            creep.say('???')
            return
    }
}
