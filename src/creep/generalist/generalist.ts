import { find_consume, find_obtain } from "./task.finder"
import { task_performers } from "./task.performer"

export const generalist_run = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'generalist')
        return
    
    if(creep.memory.class_memory.state == 'obtain'){
        perform_obtain(creep)
    }else if(creep.memory.class_memory.state == 'consume'){
        perform_consume(creep)
    }
}

const perform_obtain = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'generalist')
        return
    
    if(creep.room.name != creep.memory.resource_room){
        creep.moveTo(new RoomPosition(25,25,creep.memory.resource_room))
        return
    }
    
    if(creep.store.getFreeCapacity() == 0){
        delete creep.memory.class_memory.obtain
        creep.memory.class_memory.state = 'consume'
        return
    }

    var ret_val:TaskReturnCode = 'idle'
    var task:ObtainTask|null|undefined = creep.memory.class_memory.obtain
    if(task){
        const action = task.action
        switch (action) {
            case "harvest":
                ret_val = task_performers[action](creep,task)
                break
            case "withdraw":
                ret_val = task_performers[action](creep,task)
                break
        }
    }

    switch (ret_val) {
        case 'doing':
            return
        case 'idle':
        case 'error':
        case 'done_one':
            delete creep.memory.class_memory.obtain
            break
        case 'done_all':
            delete creep.memory.class_memory.obtain
            creep.memory.class_memory.state = 'consume'
            return
    }

    task = find_obtain(creep)
    if(task){
        const action = task.action
        creep.memory.class_memory.obtain = task
        switch (action) {
            case "harvest":
                task_performers[action](creep,task)
                break
            case "withdraw":
                task_performers[action](creep,task)
                break
        }
    }

}

const perform_consume = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'generalist')
        return
    
    if(creep.room.name != creep.memory.target_room){
        creep.moveTo(new RoomPosition(25,25,creep.memory.target_room))
        return
    }
    
    if(creep.store.getUsedCapacity() == 0){
        delete creep.memory.class_memory.consume
        creep.memory.class_memory.state = 'obtain'
        return
    }

    var ret_val:TaskReturnCode = 'idle'
    var task:ConsumeTask|null|undefined = creep.memory.class_memory.consume
    if(task){
        const action = task.action
        switch (action) {
            case 'build':
                ret_val = task_performers[action](creep,task)
                break
            case 'repair':
                ret_val = task_performers[action](creep,task)
                break
            case 'transfer':
                ret_val = task_performers[action](creep,task)
                break
            case 'upgrade':
                ret_val = task_performers[action](creep,task)
                break
        }
        
    }

    switch (ret_val) {
        case 'doing':
            return
        case 'idle':
        case 'error':
        case 'done_one':
            delete creep.memory.class_memory.consume
            break
        case 'done_all':
            delete creep.memory.class_memory.consume
            creep.memory.class_memory.state = 'obtain'
            return
    }
    
    task = find_consume(creep)
    if(task){
        const action = task.action
        creep.memory.class_memory.consume = task
        switch (action) {
            case 'build':
                ret_val = task_performers[action](creep,task)
                break
            case 'repair':
                ret_val = task_performers[action](creep,task)
                break
            case 'upgrade':
                ret_val = task_performers[action](creep,task)
                break
        }
    }

}