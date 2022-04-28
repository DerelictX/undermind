export const memory_inspector: {[k in keyof RoomMemory]:
    (room: Room) => void
} = {
    structures: function(room: Room){
        let wallHits = 100000
        if(room.controller){
            wallHits += room.controller.level * room.controller.level * 100000
        }
        room.memory.structures={
            factory:        null,
            power_spawn:    null,
            nuker:          null,
            observer:       null,
            towers:         [],
            links_in:       [],
            link_nexus:     [],
            links_out:      [],
            containers_in:  [],
            containers_out: [],
            labs_in:        [],
            labs_out:       [],
            wall_hits:      wallHits
        }
    },
    spawn_loop: function(room: Room){
        const spawn_loop:RoleSpawnLoop={
            succeed_time:   Game.time+100,
            succ_interval:  1500,
            body_parts:     [],
            boost_queue:    [],
            queued:         0
        }
        room.memory.spawn_loop={
            pioneer:    spawn_loop,
            builder:    spawn_loop,
            maintainer: spawn_loop,
            fortifier:  spawn_loop,

            harvester_m:    spawn_loop,
            harvester_s0:   spawn_loop,
            harvester_s1:   spawn_loop,
            upgrader_s:     spawn_loop,
            reserver:       spawn_loop,

            supplier:   spawn_loop,
            collector:  spawn_loop,
            emergency:  spawn_loop,

            healer:     spawn_loop,
            melee:      spawn_loop,
            ranged:     spawn_loop,
        }
    },
    tasks: function(room: Room){
        room.memory.tasks={
            harvest:    [],
            harvest_m:  [],
            upgrade:    [],
        }
    },
    reaction: function(room: Room){
        room.memory.reaction=[]
    },
    boost: function(room: Room){
        room.memory.boost=[]
    },
    import_cost: function(room: Room){
        
    }
}

export const harvest_updater = {
    source: function(room: Room){
        room.memory.tasks.harvest = []
        const sources = room.find(FIND_SOURCES)
        for(let i in sources) {
            const source: Source = sources[i]

            let container:StructureContainer|null = source.pos.findClosestByRange(FIND_STRUCTURES,{
                filter: {structureType: STRUCTURE_CONTAINER}
            })
            if(!container || !container.pos.isNearTo(source)) continue
            let task: StaticHarvestTask = {
                target:         source.id,
                structs_from:   [container.id],
                structs_to:     []
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
                task.structs_to.push(near_structs[j].id)
            }
            room.memory.tasks.harvest.push(task)
        }
    },

    mineral: function(room: Room){
        room.memory.tasks.harvest_m = []
        const mineral: Mineral = room.find(FIND_MINERALS,{
            filter: (mineral) => {return mineral.mineralAmount > 0}
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
