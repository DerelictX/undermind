import { gofor_boost } from "../fighter/fighter"

export const specialist_run = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'specialist')
        return

    role_performers[creep.memory.class_memory.role](creep)
}

const role_performers = {
    harvester_m(creep: Creep) {
        const task:StaticHarvestTask = creep.room.memory.tasks.harvest_m[0]
        if(!task) return
        const mineral = Game.getObjectById(task.target)
        const container = Game.getObjectById(task.structs_from[0])
        if(!mineral || !container) return
        
        if(!creep.pos.isEqualTo(container))
            creep.moveTo(container)
        if(container.store.getFreeCapacity('energy') > 0)
            creep.harvest(mineral)
    },
    harvester_s0(creep: Creep) {
        const task:StaticHarvestTask = creep.room.memory.tasks.harvest[0]
        if(!task) return
        const source = Game.getObjectById(task.target)
        const container = Game.getObjectById(task.structs_from[0])
        if(!source || !container) return
        
        if(!creep.pos.isEqualTo(container))
            creep.moveTo(container)
        if(container.hits <= 225000)
            creep.repair(container)
        if(creep.store.getFreeCapacity('energy') > 0
            || container.store.getFreeCapacity('energy') > 0)
            creep.harvest(source)

        if(creep.store.getFreeCapacity('energy') > 0)
            return
        for(let id of task.structs_to){
            const struct = Game.getObjectById(id);
            if(struct && struct.store && struct.store.getFreeCapacity('energy') > 0){
                creep.transfer(struct,'energy')
                break
            }
        }
    },
    harvester_s1(creep: Creep) {
        const task:StaticHarvestTask = creep.room.memory.tasks.harvest[1]
        if(!task) return
        const source = Game.getObjectById(task.target)
        const container = Game.getObjectById(task.structs_from[0])
        if(!source || !container) return
        
        if(!creep.pos.isEqualTo(container))
            creep.moveTo(container)
        if(container.hits <= 225000)
            creep.repair(container)
        if(creep.store.getFreeCapacity('energy') > 0
            || container.store.getFreeCapacity('energy') > 0)
            creep.harvest(source)

        if(creep.store.getFreeCapacity('energy') > 0)
            return
        for(let id of task.structs_to){
            const struct = Game.getObjectById(id);
            if(struct && struct.store && struct.store.getFreeCapacity('energy') > 0){
                creep.transfer(struct,'energy')
                break
            }
        }
    },

    upgrader_s(creep:Creep) {
        if(creep.memory.boost_queue.length){
            gofor_boost(creep)
            return
        }

        const task:StaticUpgradeTask = creep.room.memory.tasks.upgrade[0]
        if(!task) return
        const controller = Game.getObjectById(task.target)
        if(!controller || !controller.my)
            return
        
        if(!creep.pos.inRangeTo(controller,3))
            creep.moveTo(controller)

        if(creep.store['energy'] <= 10){
            const struct = task.structs_from.map(id => Game.getObjectById(id))
                .find(s => s && s.store['energy'] > 0)
            if(struct){
                if(creep.withdraw(struct,'energy') == ERR_NOT_IN_RANGE)
                    creep.moveTo(struct)
            }
        }
    
        creep.upgradeController(controller);
    },

    reserver(creep:Creep){
        const flag = Game.flags.claim
        if(!flag) return
        if(creep.pos.isEqualTo(flag)){
            const controller = creep.room.controller
            if(!controller) return
            if(controller.owner)
                creep.attackController(controller)
            else creep.reserveController(controller)
        } else {
            creep.moveTo(Game.flags.claim,{reusePath:100})
        }
    }
}