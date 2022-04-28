type collect_task_name = 'harvested'|'loot'|'sweep'|'compound'

const collect_scanner: {[s in collect_task_name]: (room:Room) => WithdrawTask[]} = {

    harvested: function(room:Room):WithdrawTask[] {
        let tasks:WithdrawTask[] = []

        const links_nexi = room.memory.structures.link_nexus
            .map(id => Game.getObjectById(id))
            .filter(s => s && s.store['energy'] >= 300)
        for(let link of links_nexi){
            if(!link) continue
            tasks.push({
                target:         link.id,
                resourceType:   'energy',
                amount:         link.store['energy']
            })
        }

        const containers = room.memory.structures.containers_in
            .map(id => Game.getObjectById(id))
            .filter(s => s && s.store.getUsedCapacity() >= 1200)
        for(let container of containers){
            if(!container) continue
            var store: StorePropertiesOnly = container.store
            var resourceType: keyof typeof store
            for(resourceType in store){
                tasks.push({
                    target:         container.id,
                    resourceType:   resourceType,
                    amount:         container.store[resourceType]
                })
            }
        }

        return tasks
    },

    loot: function(room:Room):WithdrawTask[] {
        let tasks:WithdrawTask[] = []

        const hostile_stores:(AnyStoreStructure&AnyOwnedStructure)[] = room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_STORAGE
                    || structure.structureType == STRUCTURE_TERMINAL)
                    return structure.store.getUsedCapacity() > 0
                return false
            }
        })
        for(let i in hostile_stores){
            const hostile_store = hostile_stores[i]
            var store: StorePropertiesOnly = hostile_store.store
            var resourceType: keyof typeof store
            for(resourceType in store){
                tasks.push({
                    target:         hostile_store.id,
                    resourceType:   resourceType,
                    amount:         hostile_store.store[resourceType]
                })
            }
        }

        return tasks
    },

    sweep: function(room:Room):WithdrawTask[] {
        let tasks:WithdrawTask[] = []

        const tombstones:Tombstone[] = room.find(FIND_TOMBSTONES, {
            filter: (tombstone) => {
                return tombstone.store.getUsedCapacity() >= 200
            }
        })
        for(let tombstone of tombstones){
            var store: StorePropertiesOnly = tombstone.store
            var resourceType: keyof typeof store
            for(resourceType in store){
                tasks.push({
                    target:         tombstone.id,
                    resourceType:   resourceType,
                    amount:         tombstone.store[resourceType]
                })
            }
        }

        const ruins:Ruin[] = room.find(FIND_RUINS, {
            filter: (ruin) => {
                return ruin.store.getUsedCapacity() > 0
            }
        })
        for(let ruin of ruins){
            var store: StorePropertiesOnly = ruin.store
            var resourceType: keyof typeof store
            for(resourceType in store){
                tasks.push({
                    target:         ruin.id,
                    resourceType:   resourceType,
                    amount:         ruin.store[resourceType]
                })
            }
        }
        return tasks
    },

    compound: function(room:Room):WithdrawTask[] {
        let tasks:WithdrawTask[] = []
        const reaction = room.memory.reaction;
        if(!reaction) return []
        const compoundType = reaction[2];
            
        for(let i in room.memory.structures.labs_out){
            const boostType:MineralBoostConstant|undefined = room.memory.boost[i]
            const lab_out = Game.getObjectById(room.memory.structures.labs_out[i])
            if(!lab_out || boostType)continue

            if(boostType){
                if(lab_out.mineralType && boostType != lab_out.mineralType){
                    tasks.push({
                        target:         lab_out.id,
                        resourceType:   lab_out.mineralType,
                        amount:         lab_out.store[lab_out.mineralType]
                    })
                }
            } else {
                if(lab_out.mineralType && (compoundType != lab_out.mineralType
                    || lab_out.store[compoundType] >= 600)){
                    tasks.push({
                        target:         lab_out.id,
                        resourceType:   lab_out.mineralType,
                        amount:         lab_out.store[lab_out.mineralType]
                    })
                }
            }
        }
        return tasks
    }
}