type supply_task_name = 'extension'|'tower'|'boost'|'reactant'|'power_spawn'

const supply_scanner: {[s in supply_task_name]: (room:Room) => TransferTask[]} = {

    extension: function(room:Room):TransferTask[] {
        let tasks:TransferTask[] = []
        const extensions:(AnyStoreStructure&AnyOwnedStructure)[] = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_EXTENSION
                    || structure.structureType == STRUCTURE_SPAWN)
                    return structure.store.getFreeCapacity('energy') > 0
                return false
            }
        })
        for(let extension of extensions){
            if(!extension) continue
            tasks.push({
                target:         extension.id,
                resourceType:   'energy',
                amount:         extension.store.getFreeCapacity('energy')
            })
        }
        return tasks
    },

    tower: function(room:Room):TransferTask[] {
        let tasks:TransferTask[] = []
        const towers = room.memory.structures.towers
            .map(id => Game.getObjectById(id))
            .filter(s => s && s.store.getFreeCapacity('energy') >= 400)
        for(let tower of towers){
            if(!tower) continue
            tasks.push({
                target:         tower.id,
                resourceType:   'energy',
                amount:         tower.store.getFreeCapacity('energy')
            })
        }
        return tasks
    },

    boost: function(room:Room):TransferTask[] {
        let tasks:TransferTask[] = []
        for(let i in room.memory.structures.labs_out){
            const boostType:MineralBoostConstant|undefined = room.memory.boost[i]
            const lab_out = Game.getObjectById(room.memory.structures.labs_out[i])
            if(!lab_out)continue

            if(boostType && lab_out.store.getFreeCapacity(boostType) >= 1800){
                tasks.push({
                    target:         lab_out.id,
                    resourceType:   boostType,
                    amount:         1200
                })
            }
            if(lab_out.store['energy'] <= 1200){
                tasks.push({
                    target:         lab_out.id,
                    resourceType:   'energy',
                    amount:         800
                })
            }
        }
        return tasks
    },

    reactant: function(room:Room):TransferTask[] {
        let tasks:TransferTask[] = []
        const reaction = room.memory.reaction;
        if(!reaction) return []

        for(let i in room.memory.structures.labs_in){
            const reactantType = reaction[i];
            const lab_in = Game.getObjectById(room.memory.structures.labs_in[i]);
            if(!lab_in)continue
            
            //reactant
            if(lab_in.store.getFreeCapacity(reactantType) > 2400){
                tasks.push({
                    target:         lab_in.id,
                    resourceType:   reactantType,
                    amount:         400
                })
            }
        }
        return tasks
    },
    
    power_spawn: function(room:Room):TransferTask[] {
        let tasks:TransferTask[] = []
        if(!room.memory.structures.power_spawn) return []
        const power_spawn = Game.getObjectById(room.memory.structures.power_spawn)
        if(!power_spawn) return []
 
        if(power_spawn.store['energy'] <= 3000){
            tasks.push({
                target:         power_spawn.id,
                resourceType:   'energy',
                amount:         power_spawn.store.getFreeCapacity('energy')
            })
        }
        if(power_spawn.store['power'] <= 50){
            tasks.push({
                target:         power_spawn.id,
                resourceType:   'power',
                amount:         power_spawn.store.getFreeCapacity('power')
            })
        }
        return tasks
    }
}