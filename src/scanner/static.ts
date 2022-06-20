export const static_updater: TaskUpdater<StaticController> = {
    source: function (room: Room): StaticBehavior[] {
        var tasks: StaticBehavior[] = []
        const sources = room.find(FIND_SOURCES)
        for(let source of sources) {
            const container:StructureContainer|null = source.pos.findClosestByRange(FIND_STRUCTURES,{
                filter: {structureType: STRUCTURE_CONTAINER}
            })
            if(!container || !container.pos.isNearTo(source)) continue
            let task: StaticBehavior = {
                bhvr_name: "static",
                pos: container.pos,
                range:  0,
                input:  [{action:'harvest',args:[source.id]}],
                output: [{action:'repair',args:[container.id]}]
            }
            
            const near_structs:AnyStoreStructure[] = container.pos.findInRange(FIND_STRUCTURES,1,{
                filter: (structure) => {
                    if(structure.structureType == STRUCTURE_CONTAINER
                        || structure.structureType == STRUCTURE_STORAGE
                        || structure.structureType == STRUCTURE_TERMINAL
                        || structure.structureType == STRUCTURE_LINK)
                        return true
                    return false
                }
            })
            near_structs.sort((a, b) => a.store.getCapacity('energy') - b.store.getCapacity('energy'))
            for(let struct of near_structs){
                task.output.push({action:'transfer',args:[struct.id,'energy']})
            }
            tasks.push(task)
        }
        return tasks
    },
    mineral: function (room: Room): StaticBehavior[] {
        var tasks: StaticBehavior[] = []
        const minerals = room.find(FIND_MINERALS,{
            filter: (mineral) => mineral.mineralAmount > 0
                && room.storage && room.storage.store[mineral.mineralType] < 100000
        })
        for(let mineral of minerals) {
            const container:StructureContainer|null = mineral.pos.findClosestByRange(FIND_STRUCTURES,{
                filter: {structureType: STRUCTURE_CONTAINER}
            })
            if(!container || !container.pos.isNearTo(mineral) || container.store.getFreeCapacity() == 0)
                continue
            let task: StaticBehavior = {
                bhvr_name: "static",
                pos: container.pos,
                range:  0,
                input:  [{action:'harvest',args:[mineral.id]}],
                output: [{action:'transfer',args:[container.id,mineral.mineralType]}]
            }
            if(task) tasks.push(task)
        }
        return tasks
    },
    upgrade: function (room: Room): StaticBehavior[] {
        const controller = room.controller;
        if(!controller || !controller.my) return []
        let task: StaticBehavior = {
            bhvr_name: "static",
            pos: controller.pos,
            range:  3,
            input:  [],
            output: [{action:'upgradeController',args:[controller.id]}]
        }
        const energy_structs: AnyStoreStructure[] = controller.pos.findInRange(FIND_STRUCTURES,3,{
            filter: structure => structure.structureType == STRUCTURE_CONTAINER
                || structure.structureType == STRUCTURE_STORAGE
                || structure.structureType == STRUCTURE_TERMINAL
                || structure.structureType == STRUCTURE_LINK
        })
        if(!energy_structs[0]) return []
        energy_structs.sort((a, b) => a.store.getCapacity('energy') - b.store.getCapacity('energy'))
        for(let struct of energy_structs){
            task.input.push({action:'withdraw',args:[struct.id,'energy']})
        }
        return [task]
    },
    reserve: function (room: Room): CachedRoomTasks<ClaimAction> {
        throw new Error("Function not implemented.")
    },
    siege: function (room: Room): CachedRoomTasks<"dismantle"> {
        throw new Error("Function not implemented.")
    }
}
