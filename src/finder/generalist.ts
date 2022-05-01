
export const find_obtain = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'generalist')
        return
    const role: GeneralistRoleName = creep.memory.class_memory.role
    var priority: ObtainPriority
    var duty: ActionDescript<PrimitiveAction>|null

    priority = obtain[role]
    for(let i in priority){
        duty = obtain_finders[priority[i]](creep)
        if(duty){
            //creep.say(':'+ priority[i])
            return duty
        }
    }
}

export const find_consume = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'generalist')
        return
    const role:GeneralistRoleName = creep.memory.class_memory.role
    var priority: ConsumePriority
    var duty: ConsumeTask|null

    priority = consume[role]
    for(let i in priority){
        duty = consume_finders[priority[i]](creep)
        if(duty){
            //creep.say(':'+ priority[i])
            return duty
        }
    }
}

type ObtainPriority = {[i:number]:keyof typeof obtain_finders}
const obtain: {[role in GeneralistRoleName]:ObtainPriority} = {

    builder:    ['withdraw_energy','harvest_autarky'],
    maintainer: ['withdraw_energy'],
    fortifier:  ['unstore_energy'],
    pioneer:    ['loot_energy','withdraw_energy'],
}

type ConsumePriority = {[i:number]:keyof typeof consume_finders}
const consume: {[role in GeneralistRoleName]:ConsumePriority} = {

    builder: [
        'repair_damaged','build',
        'fortify','upgrade_autarky','over_fortify'
    ],
    maintainer: [
        'repair_damaged','fill_extensions','repair_decayed',
        'fortify','upgrade_autarky','over_fortify'
    ],
    fortifier:  [
        'repair_damaged','build',
        'fortify','over_fortify'
    ],
    pioneer: [
        'fill_extensions','repair_damaged','build',
        'upgrade_autarky','fortify','over_fortify'
    ]
}



const obtain_finders = {
    withdraw_energy: function(creep: Creep): ActionDescript<'withdraw'>|null{
        let target: AnyStoreStructure|null = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_CONTAINER)
                    return structure.store['energy'] >= 800
                if(structure.structureType == STRUCTURE_STORAGE
                    || structure.structureType == STRUCTURE_TERMINAL)
                    return structure.store['energy'] >= 10000
                return false
            }
        })
        if(target)
            return {action:"withdraw", target:target.id}
        return null
    },

    harvest_autarky: function(creep: Creep): HarvestTask|null{
        let target = creep.pos.findClosestByRange(FIND_SOURCES, {
            filter: (source) => {
                return source.energy==source.energyCapacity
                    || source.energy > source.ticksToRegeneration*10
            }
        })
        if(target)
            return {action:"harvest", target:target.id}
        return null
    },

    unstore_energy: function(creep: Creep): WithdrawEnergyTask|null{
        let target:StructureStorage|StructureTerminal|undefined = creep.room.storage
        if(target && target.store['energy'] > 200000){
            return {action:"withdraw", target:target.id}
        }
        target = creep.room.terminal
        if(target && target.store['energy'] > 100000){
            return {action:"withdraw", target:target.id}
        }
        return null
    },

    loot_energy: function(creep: Creep): WithdrawEnergyTask|null{
        let target: AnyOwnedStructure&AnyStoreStructure|null = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_SPAWN
                    || structure.structureType == STRUCTURE_EXTENSION
                    || structure.structureType == STRUCTURE_TOWER
                    || structure.structureType == STRUCTURE_LAB
                    || structure.structureType == STRUCTURE_LINK)
                    return structure.store['energy'] > 0
                return false
            }
        })
        if(target)
            return {action:"withdraw", target:target.id}
        return null
    },
}

const consume_finders = {
    upgrade_autarky: function(creep: Creep): UpgradeTask|null{
        let target = creep.room.controller;
        if(target && (target.level<=7 || target.ticksToDowngrade<=190000))
            return {action:"upgrade", target:target.id}
        return null
    },
    
    fill_extensions :function(creep:Creep): TransferEnergyTask|null {
        if(creep.room.energyAvailable == creep.room.energyCapacityAvailable)
            return null
        let target: AnyOwnedStructure&AnyStoreStructure|null = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_SPAWN
                    || structure.structureType == STRUCTURE_EXTENSION)
                    return structure.store.getFreeCapacity('energy') > 0
                if(structure.structureType == STRUCTURE_TOWER)
                    return structure.store.getFreeCapacity('energy') >= 300
                return false
            }
        })
        if(target)
            return {action:'transfer', target:target.id}
        return null
    },

    build: function(creep:Creep): BuildTask|null{
        let target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES)
        if(target)
            return {action:"build", target:target.id}
        return null
    },

    repair_damaged: function(creep: Creep): RepairTask|null{
        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_RAMPART
                    || structure.structureType == STRUCTURE_WALL)
                    return structure.hits < 10000
                if(structure.structureType == STRUCTURE_CONTAINER
                    || structure.structureType == STRUCTURE_ROAD)
                    return structure.hits < structure.hitsMax/2
                return structure.hits < structure.hitsMax
            }
        })
        if(target)
            return {action:"repair", target:target.id}
        return null
    },

    repair_decayed: function(creep:Creep): RepairTask|null{
        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_ROAD)
                    return structure.hits < structure.hitsMax - 1500
                if(structure.structureType == STRUCTURE_CONTAINER)
                    return structure.hits < 200000
                return false
            }
        })
        if(target)
            return {action:"repair", target:target.id}
        return null
    },

    fortify: function(creep:Creep): RepairTask|null{
        var wallHits = creep.room.memory.structures.wall_hits - 1000
        if(wallHits >= 100000)
            creep.room.memory.structures.wall_hits = wallHits

        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_RAMPART
                    || structure.structureType == STRUCTURE_WALL)
                    return structure.hits < wallHits
                return false
            }
        })
        if(target)
            return {action:"repair", target:target.id}
        return null
    },

    over_fortify: function(creep:Creep): RepairTask|null{
        var wallHits = creep.room.memory.structures.wall_hits + 30000
        if(wallHits <= 100000000)
            creep.room.memory.structures.wall_hits = wallHits

        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_RAMPART
                    || structure.structureType == STRUCTURE_WALL)
                    return structure.hits < wallHits
                return false
            }
        })
        if(target)
            return {action:"repair", target:target.id}
        return null
    },

}