const static_updater: TaskUpdater<StaticController> = {
    source: function(room: Room){
        tasks = []
        const sources = room.find(FIND_SOURCES)
        for(let source of sources) {
            let container:StructureContainer|null = source.pos.findClosestByRange(FIND_STRUCTURES,{
                filter: {structureType: STRUCTURE_CONTAINER}
            })
            if(!container || !container.pos.isNearTo(source)) continue
            let task: StaticBehavior = {
                bhvr_name: "static",
                pos: container.pos,
                input:  [],
                output: []
            }
            
            const near_structs:AnyStoreStructure[] = container.pos.findInRange(FIND_STRUCTURES,1,{
                filter: (structure) => {
                    if(structure.structureType == STRUCTURE_TOWER
                        || structure.structureType == STRUCTURE_SPAWN
                        || structure.structureType == STRUCTURE_EXTENSION
                        || structure.structureType == STRUCTURE_STORAGE
                        || structure.structureType == STRUCTURE_TERMINAL
                        || structure.structureType == STRUCTURE_LINK)
                        return true
                    return false
                }
            })
            near_structs.sort((a, b) => a.store.getCapacity('energy') - b.store.getCapacity('energy'))
            for(let j in near_structs){
                task.tr.push(near_structs[j].id)
            }
            room.memory.tasks.harvest.push(task)
        }
    },

    mineral: function(room: Room){
        room.memory.tasks.harvest_m = []
        const mineral: Mineral = room.find(FIND_MINERALS,{
            filter: (mineral) => {
                if(room.storage && room.storage.store[mineral.mineralType] < 100000)
                    return mineral.mineralAmount > 0
                return false
            }
        })[0]
        if(!mineral) return

        const container:StructureContainer|null = mineral.pos.findClosestByRange(FIND_STRUCTURES,{
            filter: {structureType: STRUCTURE_CONTAINER}
        })
        if(!container || !container.pos.isNearTo(mineral) || container.store.getFreeCapacity() == 0)
            return
        let task: StaticHarvestTask = {
            target:         mineral.id,
            structs_from:   [container.id],
            structs_to:     [],
        }
        room.memory.tasks.harvest_m.push(task)
    },

    upgrade: function(room: Room){
        room.memory.tasks.upgrade = []
        const controller = room.controller;
        if(controller){
            let task: StaticUpgradeTask = {
                target:         controller.id,
                structs_from:   [],
                structs_to:     [],
            }
            const energy_structs: AnyStoreStructure[] = controller.pos.findInRange(FIND_STRUCTURES,3,{
                filter: structure => structure.structureType == STRUCTURE_CONTAINER
                    || structure.structureType == STRUCTURE_STORAGE
                    || structure.structureType == STRUCTURE_TERMINAL
                    || structure.structureType == STRUCTURE_LINK
            })
            if(!energy_structs[0]) return
            energy_structs.sort((a, b) => a.store.getCapacity('energy') - b.store.getCapacity('energy'))
            for(let j in energy_structs){
                task.structs_from.push(energy_structs[j].id)
            }
            room.memory.tasks.upgrade.push(task)
        }
    }
}
