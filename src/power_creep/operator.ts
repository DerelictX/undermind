import { crawlTo } from "@/move/path"

export const operator_run = function(operator:PowerCreep){
    if(!operator.room) return
    let ret: ScreepsReturnCode = ERR_NOT_FOUND

    if(operator.memory._tasks[0]){
        ret = perform_normal(operator,operator.memory._tasks[0])
        if(ret == ERR_NOT_IN_RANGE){
            return
        }
        operator.memory._tasks.shift()
        return
    }

    if(!operator.memory._power[0]) {
        find_power_task(operator)
    }
    const pwr_task = operator.memory._power[0]
    if(!pwr_task){
        operator.usePower(PWR_GENERATE_OPS)
        delete operator.memory._move
        return
    }

    const target = Game.getObjectById(pwr_task.target)
    if(target) {
        ret = operator.usePower(pwr_task.power,target)
        if(ret == ERR_NOT_IN_RANGE){
            crawlTo(operator,target.pos)
            operator.usePower(PWR_GENERATE_OPS)
            return
        }
    }
    operator.memory._power.shift()
}

function find_power_task(operator: PowerCreep) {
    if(operator.ticksToLive && operator.ticksToLive < 2000){
        const power_spawn_id = operator.room?.memory._typed._struct?.power_spawn
        if(power_spawn_id)
            operator.memory._tasks.push({action:'renew',args:[power_spawn_id]})
    }
    if(operator.store.getFreeCapacity('ops') < 20){
        const storage = operator.room?.storage
        if(storage)
            operator.memory._tasks.push({
                action:'transfer',
                args:[storage.id,'ops',operator.store['ops'] * 0.4]
            })
    }/*
    if(operator.store.getUsedCapacity('ops') < operator.store.getCapacity() * 0.2){
        const storage = operator.room?.storage
        if(storage)
            operator.memory._tasks.push({
                action:'withdraw',
                args:[storage.id,'ops',operator.store.getFreeCapacity() * 0.4]
            })
    }*/

    if(operator.powers[PWR_OPERATE_LAB] && !operator.powers[PWR_OPERATE_LAB].cooldown){
        const labs = operator.room?.memory._typed._struct?.labs
        if(!labs?.reaction) return
        for (let id of labs.outs) {
            const lab_in = Game.getObjectById(id)
            if(lab_in && (!lab_in.effects || !lab_in.effects[0]) && lab_in.cooldown > 0){
                operator.memory._power.push({
                    power:  PWR_OPERATE_LAB,
                    target: id
                })
                break
            }
        }
    }
}

const perform_normal = function(operator:PowerCreep, task:PowerActionDescript<PowerAction>){
    let ret: ScreepsReturnCode
    switch(task.action){
        case 'renew': {
            const target = Game.getObjectById(task.args[0])
            if(!target) return ERR_NOT_FOUND
            ret = operator.renew(target)
            if(ret == ERR_NOT_IN_RANGE)
                crawlTo(operator,target.pos)
            return ret
        }
        case 'enableRoom': {
            const target = Game.getObjectById(task.args[0])
            if(!target) return ERR_NOT_FOUND
            ret = operator.enableRoom(target)
            if(ret == ERR_NOT_IN_RANGE)
                crawlTo(operator,target.pos)
            return ret
        }
        case 'transfer': {
            const target = Game.getObjectById(task.args[0])
            if(!target) return ERR_NOT_FOUND

            if(!operator.store.getUsedCapacity(task.args[1]))
                return ERR_NOT_ENOUGH_RESOURCES
            if(!target.store.getFreeCapacity(task.args[1]))
                return ERR_FULL

            let ret = operator.transfer(target,task.args[1],task.args[2]);
            if(ret == ERR_FULL || ret == ERR_NOT_ENOUGH_RESOURCES)
                ret = operator.transfer(target,task.args[1])

            if(ret == ERR_NOT_IN_RANGE)
                crawlTo(operator,target.pos)
            return ret
        }
        case 'withdraw': {
            const target = Game.getObjectById(task.args[0])
            if(!target) return ERR_NOT_FOUND

            if(!operator.store.getFreeCapacity(task.args[1]))
                return ERR_FULL
            if(!target.store.getUsedCapacity(task.args[1]))
                return ERR_NOT_ENOUGH_RESOURCES

            let ret = operator.withdraw(target,task.args[1],task.args[2]);
            if(ret == ERR_FULL || ret == ERR_NOT_ENOUGH_RESOURCES)
                ret = operator.withdraw(target,task.args[1])

            if(ret == ERR_NOT_IN_RANGE)
                crawlTo(operator,target.pos)
            return ret
        }
    }
}