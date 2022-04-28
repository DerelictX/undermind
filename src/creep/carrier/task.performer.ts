
export const _collect = function(creep:Creep, params:TransportTask):TaskReturnCode {
    const source = Game.getObjectById(params.source)

    if(!source){
        creep.say('ERR:' + ERR_NOT_FOUND)
        return 'error'
    }
    if(creep.store.getFreeCapacity(params.resourceType) < params.amount){
        creep.say('ERR:' + ERR_FULL)
        return 'error'
    }
    if(source.store[params.resourceType] < params.amount){
        creep.say('ERR:' + ERR_NOT_ENOUGH_RESOURCES)
        return 'error'
    }

    if(!creep.pos.isNearTo(source)){
        creep.moveTo(source)
        return 'doing'
    }
    const ret_val = creep.withdraw(source,params.resourceType,params.amount)
    if(ret_val == OK){
        return 'done_one'
    }
    else{
        creep.say('ERR:' + ret_val)
        return 'error'
    }
}

export const _supply = function(creep:Creep, params:TransportTask):TaskReturnCode {
    const target = Game.getObjectById(params.target)

    if(!target){
        creep.say('ERR:' + ERR_NOT_FOUND)
        return 'error'
    }
    if(creep.store[params.resourceType] == 0){
        creep.say('ERR:' + ERR_NOT_ENOUGH_RESOURCES)
        return 'error'
    }
    const free = target.store.getFreeCapacity(params.resourceType)
    if(!free || free == 0){
        creep.say('ERR:' + ERR_FULL)
        return 'error'
    }
    params.amount = Math.min(params.amount,
        creep.store[params.resourceType],free)
    if(params.amount <= 0){
        creep.say('ERR:' + ERR_INVALID_ARGS)
        return 'error'
    }

    if(!creep.pos.isNearTo(target)){
        creep.moveTo(target)
        return 'doing'
    }
    const ret_val = creep.transfer(target,params.resourceType,params.amount)
    if(ret_val == OK){
        return 'done_one'
    }
    else{
        creep.say('ERR:' + ret_val)
        return 'error'
    }
}
