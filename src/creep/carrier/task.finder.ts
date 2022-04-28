export const find_transport = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'carrier')
        return
    const role: CarrierRoleName = creep.memory.class_memory.role
    var priority: TransportPriority
    var duty: TransportTask|null

    priority = transport[role]
    for(let i in priority){
        duty = transport_finders[priority[i]](creep)
        if(duty){
            //creep.say(':'+ priority[i])
            creep.memory.class_memory.collect[0] = duty
            return
        }
    }
}

export const find_store = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'carrier')
        return
    var storage:(AnyStoreStructure&AnyOwnedStructure)|undefined
    storage = creep.room.storage
    if(!storage || !storage.my || storage.store.getFreeCapacity() < 100000)
        storage = creep.room.terminal
    if(!storage || !storage.my || storage.store.getFreeCapacity() < 100000)
        return null
    
    var store: StorePropertiesOnly = creep.store
    var resourceType: keyof typeof store
    for(resourceType in store){
        creep.memory.class_memory.supply.push({
            source:         storage.id,
            target:         storage.id,
            resourceType:   resourceType,
            amount:         creep.store[resourceType]
        })
    }
}

type TransportPriority = {[i:number]:keyof typeof transport_finders}
const transport: {[role in CarrierRoleName]:TransportPriority} = {
    collector:  ['containers','sweep','compound','loot','terminal'],
    supplier:   ['extensions','towers','boost','reactant','power_spawn'],
    emergency:  ['extensions','containers']
}

const transport_finders = {
    
    containers: function(creep:Creep):TransportTask|null {
        var storage:(AnyStoreStructure&AnyOwnedStructure)|undefined
        storage = creep.room.storage
        if(!storage || !storage.my || storage.store.getFreeCapacity() < 200000)
            return null
        if(storage.store['energy'] > storage.store.getCapacity() * 0.4)
            return null

        const link_nexus = Game.getObjectById(creep.room.memory.structures.link_nexus[0])
        if(link_nexus && link_nexus.store['energy'] >= 300){
            return {
                source:         link_nexus.id,
                target:         storage.id,
                resourceType:   'energy',
                amount:         Math.min(
                    creep.store.getFreeCapacity(),
                    link_nexus.store['energy'])
            }
        }

        const containers = creep.room.memory.structures.containers_in
                .map(id => Game.getObjectById(id))
                .filter(c => c && c.store.getUsedCapacity() >= 1200)

        for(let container of containers){
            if(!container) continue
            var store: StorePropertiesOnly = container.store
            var resourceType: keyof typeof store
            for(resourceType in store){
                return {
                    source:         container.id,
                    target:         storage.id,
                    resourceType:   resourceType,
                    amount:         Math.min(
                        creep.store.getFreeCapacity(),
                        container.store[resourceType])
                }
            }
        }

        return null
    },

    loot: function(creep:Creep):TransportTask|null {
        if(creep.ticksToLive && creep.ticksToLive < 50)
            return null

        var storage:(AnyStoreStructure&AnyOwnedStructure)|undefined
        storage = creep.room.storage
        if(!storage || !storage.my || storage.store.getFreeCapacity() < 100000)
            storage = creep.room.terminal
        if(!storage || !storage.my || storage.store.getFreeCapacity() < 100000)
            return null

        const hostile_stores:(AnyStoreStructure&AnyOwnedStructure)[] = creep.room.find(FIND_HOSTILE_STRUCTURES, {
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
                return {
                    source:         hostile_store.id,
                    target:         storage.id,
                    resourceType:   resourceType,
                    amount:         Math.min(creep.store.getFreeCapacity(),hostile_store.store[resourceType])
                }
            }
        }
        
        return null
    },

    sweep: function(creep:Creep):TransportTask|null {
        var storage:(AnyStoreStructure&AnyOwnedStructure)|undefined
        storage = creep.room.storage
        if(!storage || !storage.my || storage.store.getFreeCapacity() < 50000)
            storage = creep.room.terminal
        if(!storage || !storage.my || storage.store.getFreeCapacity() < 50000)
            return null

        const tombstones:Tombstone[] = creep.room.find(FIND_TOMBSTONES, {
            filter: (tombstone) => {
                return tombstone.store.getUsedCapacity() >= 200
            }
        })
        for(let i in tombstones){
            const tombstone = tombstones[i]
            var store: StorePropertiesOnly = tombstone.store
            var resourceType: keyof typeof store
            for(resourceType in store){
                return {
                    source:         tombstone.id,
                    target:         storage.id,
                    resourceType:   resourceType,
                    amount:         Math.min(
                        creep.store.getFreeCapacity(),
                        tombstone.store[resourceType])
                }
            }
        }

        const ruins:Ruin[] = creep.room.find(FIND_RUINS, {
            filter: (ruin) => {
                return ruin.store.getUsedCapacity() > 0
            }
        })
        for(let i in ruins){
            const ruin = ruins[i]
            var store: StorePropertiesOnly = ruin.store
            var resourceType: keyof typeof store
            for(resourceType in store){
                return {
                    source:         ruin.id,
                    target:         storage.id,
                    resourceType:   resourceType,
                    amount:         Math.min(
                        creep.store.getFreeCapacity(),
                        ruin.store[resourceType])
                }
            }
        }
        
        return null
    },

    extensions: function(creep:Creep):TransportTask|null {
        if(creep.room.energyAvailable == creep.room.energyCapacityAvailable)
            return null

        const source:(AnyStoreStructure&AnyOwnedStructure|null) = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_STORAGE)
                    return structure.store['energy'] >= 10000
                if(structure.structureType == STRUCTURE_TERMINAL)
                    return structure.store['energy'] >= 50000
                if(structure.structureType == STRUCTURE_CONTAINER)
                    return structure.store['energy'] >= 600
                return false
            }
        })
        if(!source)return null

        const extension:(AnyStoreStructure&AnyOwnedStructure|null) = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_EXTENSION
                    || structure.structureType == STRUCTURE_SPAWN)
                    return structure.store.getFreeCapacity('energy') > 0
                return false
            }
        })
        if(extension)
            return {
                source:         source.id,
                target:         extension.id,
                resourceType:   'energy',
                amount:         Math.min(
                    creep.store.getFreeCapacity(),
                    extension.store.getFreeCapacity('energy'))
            }
        return null
    },

    towers: function(creep:Creep):TransportTask|null {
        const source:(AnyStoreStructure&AnyOwnedStructure|null) = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_STORAGE)
                    return structure.store['energy'] >= 10000
                if(structure.structureType == STRUCTURE_TERMINAL)
                    return structure.store['energy'] >= 50000
                if(structure.structureType == STRUCTURE_CONTAINER)
                    return structure.store['energy'] >= 600
                return false
            }
        })
        if(!source)return null

        const tower:(AnyStoreStructure&AnyOwnedStructure|null) = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_TOWER)
                    return structure.store.getFreeCapacity('energy') >= 400
                return false
            }
        })
        if(tower)
            return {
                source:         source.id,
                target:         tower.id,
                resourceType:   'energy',
                amount:         Math.min(
                    creep.store.getFreeCapacity(),
                    tower.store.getFreeCapacity('energy'))
            }
        return null
    },

    power_spawn: function(creep:Creep):TransportTask|null {
        
        if(!creep.room.memory.structures.power_spawn)
            return null
        const power_spawn = Game.getObjectById(creep.room.memory.structures.power_spawn)
        if(!power_spawn)
            return null

        //energy
        if(power_spawn.store['energy'] <= 3000){
            const source:(AnyStoreStructure&AnyOwnedStructure|null) = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    if(structure.structureType == STRUCTURE_STORAGE)
                        return structure.store['energy'] >= 200000
                    if(structure.structureType == STRUCTURE_TERMINAL)
                        return structure.store['energy'] >= 100000
                    if(structure.structureType == STRUCTURE_CONTAINER)
                        return structure.store['energy'] >= 1800
                    return false
                }
            })
            if(!source)return null

            return {
                source:         source.id,
                target:         power_spawn.id,
                resourceType:   'energy',
                amount:         Math.min(creep.store.getFreeCapacity(),power_spawn.store.getFreeCapacity('energy'))
            }
        }

        //power
        if(power_spawn.store['power'] <= 50){
            const storage:(AnyStoreStructure&AnyOwnedStructure)[] = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    if(structure.structureType == STRUCTURE_STORAGE
                        || structure.structureType == STRUCTURE_TERMINAL)
                        return structure.store['power'] >= 50
                    return false
                }
            })
            if(!storage[0])return null

            return {
                source:         storage[0].id,
                target:         power_spawn.id,
                resourceType:   'power',
                amount:         Math.min(creep.store.getFreeCapacity(),50)
            }
        }

        return null
    },

    boost: function(creep:Creep):TransportTask|null {
        if(creep.ticksToLive && creep.ticksToLive < 50)
            return null

        for(let i in creep.room.memory.structures.labs_out){
            const boostType:MineralBoostConstant|undefined = creep.room.memory.boost[i]
            const lab_out = Game.getObjectById(creep.room.memory.structures.labs_out[i])
            if(!lab_out)continue

            if(boostType && lab_out.mineralType && boostType != lab_out.mineralType){
                let storage:(AnyStoreStructure&AnyOwnedStructure)|undefined
                storage = creep.room.storage
                if(!storage || !storage.my || storage.store.getFreeCapacity() < 50000)
                    storage = creep.room.terminal
                if(!storage || !storage.my || storage.store.getFreeCapacity() < 50000)
                    return null
                return {
                    source:         lab_out.id,
                    target:         storage.id,
                    resourceType:   lab_out.mineralType,
                    amount:         Math.min(
                        creep.store.getFreeCapacity(),
                        lab_out.store[lab_out.mineralType])
                }
            }

            //boost
            if(boostType && lab_out.store.getFreeCapacity(boostType) >= 1800){
                let storage:AnyStoreStructure|undefined
                storage = creep.room.storage
                if(!storage || storage.store[boostType] < 100)
                    storage = creep.room.terminal
                if(!storage || storage.store[boostType] < 100)
                    continue
                return {
                    source:         storage.id,
                    target:         lab_out.id,
                    resourceType:   boostType,
                    amount:         Math.min(
                        creep.store.getFreeCapacity(),
                        storage.store[boostType])
                }
            }

            //energy
            if(lab_out.store['energy'] <= 1200){
                let storage:AnyStoreStructure|undefined
                storage = creep.room.storage
                if(!storage || storage.store['energy'] < 50000)
                    storage = creep.room.terminal
                if(!storage || storage.store['energy'] < 50000)
                    continue
                return {
                    source:         storage.id,
                    target:         lab_out.id,
                    resourceType:   'energy',
                    amount:         Math.min(
                        creep.store.getFreeCapacity(),
                        lab_out.store.getFreeCapacity('energy'))
                }
            }
        }
        return null
    },

    reactant: function(creep:Creep):TransportTask|null {
        if(creep.ticksToLive && creep.ticksToLive < 50)
            return null
        const reaction = creep.room.memory.reaction;
        if(!reaction)return null

        for(let i in creep.room.memory.structures.labs_in){
            const reactantType = reaction[i];
            const lab_in = Game.getObjectById(creep.room.memory.structures.labs_in[i]);
            if(!lab_in)continue
            
            if(lab_in.mineralType && reactantType != lab_in.mineralType){
                let storage:(AnyStoreStructure&AnyOwnedStructure)|undefined
                storage = creep.room.storage
                if(!storage || !storage.my || storage.store.getFreeCapacity() < 50000)
                    storage = creep.room.terminal
                if(!storage || !storage.my || storage.store.getFreeCapacity() < 50000)
                    return null
                return {
                    source:         lab_in.id,
                    target:         storage.id,
                    resourceType:   lab_in.mineralType,
                    amount:         Math.min(
                        creep.store.getFreeCapacity(),
                        lab_in.store[lab_in.mineralType])
                }
            }

            //reactant
            if(lab_in.store.getFreeCapacity(reactantType) > 3000 - creep.store.getFreeCapacity()){
                let storage:AnyStoreStructure|undefined
                storage = creep.room.storage
                if(!storage || storage.store[reactantType] < 100)
                    storage = creep.room.terminal
                if(!storage || storage.store[reactantType] < 100)
                    continue
                return {
                    source:         storage.id,
                    target:         lab_in.id,
                    resourceType:   reactantType,
                    amount:         Math.min(
                        creep.store.getFreeCapacity(),
                        storage.store[reactantType])
                }
            }

            //energy
            if(lab_in.store['energy'] > 0){
                let storage:(AnyStoreStructure&AnyOwnedStructure)|undefined
                storage = creep.room.storage
                if(!storage || !storage.my || storage.store.getFreeCapacity() < 50000)
                    storage = creep.room.terminal
                if(!storage || !storage.my || storage.store.getFreeCapacity() < 50000)
                    return null
                return {
                    source:         lab_in.id,
                    target:         storage.id,
                    resourceType:   'energy',
                    amount:         Math.min(
                        creep.store.getFreeCapacity(),
                        lab_in.store['energy'])
                }
            }
        }

        return null
    },

    compound: function(creep:Creep):TransportTask|null {
        if(creep.ticksToLive && creep.ticksToLive < 50)
            return null
        const reaction = creep.room.memory.reaction;
        if(!reaction)return null
        
        const compoundType = reaction[2];
            
        for(let i in creep.room.memory.structures.labs_out){
            const boostType:MineralBoostConstant|undefined = creep.room.memory.boost[i]
            const lab_out = Game.getObjectById(creep.room.memory.structures.labs_out[i])
            if(!lab_out || boostType)continue

            if(lab_out.mineralType && (compoundType != lab_out.mineralType
                    || lab_out.store[compoundType] >= creep.store.getFreeCapacity())){
                let storage:(AnyStoreStructure&AnyOwnedStructure)|undefined
                storage = creep.room.storage
                if(!storage || !storage.my || storage.store.getFreeCapacity() < 50000)
                    storage = creep.room.terminal
                if(!storage || !storage.my || storage.store.getFreeCapacity() < 50000)
                    return null
                return {
                    source:         lab_out.id,
                    target:         storage.id,
                    resourceType:   lab_out.mineralType,
                    amount:         Math.min(
                        creep.store.getFreeCapacity(),
                        lab_out.store[lab_out.mineralType])
                }
            }
        }

        return null
    },

    terminal: function(creep:Creep):TransportTask|null {
        if(creep.ticksToLive && creep.ticksToLive < 50)
            return null
        const storage = creep.room.storage
        const terminal = creep.room.terminal
        if(!storage || !terminal)
            return null

        if(storage.my && storage.store.getFreeCapacity() > 100000){
            //termintal => storage
            var terminal_store: StorePropertiesOnly = terminal.store
            var resourceType: keyof typeof terminal_store

            for(resourceType in terminal_store){
                let target_amount = 3000
                if(resourceType == 'energy')
                    target_amount = 30000
                if(storage.store[resourceType] > target_amount * 2)
                    target_amount += target_amount
                if(terminal_store[resourceType] > target_amount){
                    return {
                        source:         terminal.id,
                        target:         storage.id,
                        resourceType:   resourceType,
                        amount:         Math.min(
                            creep.store.getFreeCapacity(),
                            terminal.store[resourceType] - target_amount)
                    }
                }
            }
        }
        
        if(terminal.my && terminal.store.getFreeCapacity() > 50000){
            //storage => terminal
            var storage_store: StorePropertiesOnly = storage.store
            var resourceType: keyof typeof storage_store

            for(resourceType in storage_store){
                let target_amount = 3000
                if(resourceType == 'energy')
                    target_amount = 30000
                if(storage.store[resourceType] > target_amount * 3)
                    target_amount += target_amount
                if(terminal.store[resourceType] < target_amount){
                    return {
                        source:         storage.id,
                        target:         terminal.id,
                        resourceType:   resourceType,
                        amount:         Math.min(
                            creep.store.getFreeCapacity(),
                            target_amount - terminal.store[resourceType],
                            storage.store[resourceType])
                    }
                }
            }
        }

        return null
    }

}