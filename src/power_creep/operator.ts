export const operator_run = function(operator:PowerCreep){
    
    if(!operator.room)
        return
    
    /*
    if(operator.room.name != 'E31S56'){
        operator.moveTo(new RoomPosition(25,25,'E31S56'))
        return
    }
    
    if(operator.room.controller && !operator.room.controller.isPowerEnabled){
        if(operator.enableRoom(operator.room.controller) == ERR_NOT_IN_RANGE){
            operator.moveTo(operator.room.controller)
        }
        return
    }

    if(operator.ticksToLive && operator.ticksToLive <= 3200){
        if(!operator.room.memory.structures.power_spawn)
            return
        const power_spawn = Game.getObjectById(operator.room.memory.structures.power_spawn)
        if(power_spawn){
            if(operator.renew(power_spawn) == ERR_NOT_IN_RANGE)
                operator.moveTo(power_spawn)
            return
        }
    }
    */

    if(operator.powers[PWR_GENERATE_OPS] && operator.powers[PWR_GENERATE_OPS].cooldown == 0){
        if(operator.store.getFreeCapacity() > 50){
            operator.usePower(PWR_GENERATE_OPS)
            return
        } else {
            const storage = operator.room.storage
            if(storage && storage.store.getFreeCapacity() > 100000
                && operator.transfer(storage,'ops',operator.store['ops']/5) == ERR_NOT_IN_RANGE)
                operator.moveTo(storage)
        }
    }

    if(operator.powers[PWR_OPERATE_LAB] && operator.powers[PWR_OPERATE_LAB].cooldown == 0){
        if(operator.store['ops'] < 100)
            return
        const labs_out = operator.room.memory.structures.labs_out;
        for(var id in labs_out){
            const lab = Game.getObjectById(labs_out[id])
            if(lab && (!lab.effects || !lab.effects[0]) && lab.cooldown > 0){
                if(operator.usePower(PWR_OPERATE_LAB,lab) == ERR_NOT_IN_RANGE)
                    operator.moveTo(lab)
                return
            }
        }
    }

    if(operator.powers[PWR_REGEN_SOURCE] && operator.powers[PWR_REGEN_SOURCE].cooldown == 0){
        const sources = operator.room.find(FIND_SOURCES);
        for(var i in sources){
            const source = sources[i]
            if(source && (!source.effects || !source.effects[0]) && source.ticksToRegeneration > 0){
                if(operator.usePower(PWR_REGEN_SOURCE,source) == ERR_NOT_IN_RANGE)
                    operator.moveTo(source)
                return
            }
        }
    }
/*
    if(operator.powers[PWR_OPERATE_STORAGE] && operator.powers[PWR_OPERATE_STORAGE].cooldown == 0){
        if(operator.store['ops'] < 600)
            return
        const storage = operator.room.storage
        if(storage && (!storage.effects || !storage.effects[0])){
            if(operator.usePower(PWR_OPERATE_STORAGE,storage) == ERR_NOT_IN_RANGE)
                operator.moveTo(storage)
            return
        }
    }
    */
}