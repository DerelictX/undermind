import { hikeTo } from "@/move/route"
import { demand_res } from "@/structure/lv6_terminal"

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
        find_power_task(operator,operator.room)
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
            hikeTo(operator,target.pos)
            operator.usePower(PWR_GENERATE_OPS)
            return
        }
    }
    operator.memory._power.shift()
}

function find_power_task(operator: PowerCreep, room: Room) {
    if(operator.ticksToLive && operator.ticksToLive < 2000){
        const power_spawn_id = room.memory.power_spawn
        if(power_spawn_id)
            operator.memory._tasks.push({action:'renew',args:[power_spawn_id]})
    }
    const controller = room.controller
    if(controller && !controller.isPowerEnabled){
        if(room.name == '???')
            operator.memory._tasks.push({action:'enableRoom',args:[controller.id]})
    }
    const storage = room.storage
    if(storage && operator.store.getFreeCapacity('ops') < 20){
        operator.memory._tasks.push({
            action:'transfer',
            args:[storage.id,'ops',operator.store['ops'] * 0.4]
        })
    }
    const terminal = room.terminal
    if(terminal && operator.store.getUsedCapacity('ops') < operator.store.getCapacity() * 0.2){
        if(terminal.store['ops'] < 1000){
            demand_res(terminal,'ops',1000)
        }
        operator.memory._tasks.push({
            action:'withdraw',
            args:[terminal.id,'ops',operator.store.getFreeCapacity() * 0.4]
        })
    }

    if(operator.powers[PWR_OPERATE_EXTENSION] && !operator.powers[PWR_OPERATE_EXTENSION].cooldown){
        if(storage && room.energyAvailable < room.energyCapacityAvailable * 0.7){
            operator.memory._power.push({power: PWR_OPERATE_EXTENSION, target: storage.id})
        }
    }

    if(operator.powers[PWR_OPERATE_STORAGE] && !operator.powers[PWR_OPERATE_STORAGE].cooldown){
        if(storage && !storage.effects?.[0]) {
            operator.memory._power.push({power: PWR_OPERATE_STORAGE, target: storage.id})
        }
    }

    if(operator.powers[PWR_OPERATE_FACTORY] && !operator.powers[PWR_OPERATE_FACTORY].cooldown){
        const config = room.memory.factory
        if(config){
            const factory = config.fact_id ? Game.getObjectById(config.fact_id) : null
            if(operator.powers[PWR_OPERATE_FACTORY].level != config.operate) return
            if(!factory || factory.cooldown || factory.effects?.[0]) return
            operator.memory._power.push({power: PWR_OPERATE_FACTORY, target: factory.id})
        }
    }

    if(operator.powers[PWR_OPERATE_LAB] && !operator.powers[PWR_OPERATE_LAB].cooldown){
        const labs = room.memory.labs   
        if(labs?.reaction){
            for (let id of labs.outs) {
                const lab_in = Game.getObjectById(id)
                if(lab_in && !lab_in.effects?.[0] && lab_in.cooldown > 0){
                    operator.memory._power.push({power: PWR_OPERATE_LAB, target: id})
                    break
                }
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
                hikeTo(operator,target.pos)
            return ret
        }
        case 'enableRoom': {
            const target = Game.getObjectById(task.args[0])
            if(!target) return ERR_NOT_FOUND
            ret = operator.enableRoom(target)
            if(ret == ERR_NOT_IN_RANGE)
                hikeTo(operator,target.pos)
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
                hikeTo(operator,target.pos)
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
                hikeTo(operator,target.pos)
            return ret
        }
    }
}