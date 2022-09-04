import _ from "lodash"

export const static_updater = {
    
    containers: function (room:Room) {
        room.memory._typed._static.W_cntn = []
        room.memory._typed._static.T_cntn = []
        const containers:StructureContainer[] = room.find(FIND_STRUCTURES,{
            filter: {structureType: STRUCTURE_CONTAINER}
        });

        for(let container of containers){
            if(container.pos.findInRange(FIND_SOURCES,2).length){
                room.memory._typed._static.W_cntn.push({
                    action: 'withdraw',
                    args: [container.id,'energy'],
                    pos: container.pos
                })
            } else {
                const mineral = container.pos.findInRange(FIND_MINERALS,2)
                if(mineral[0]) {
                    room.memory._typed._static.W_cntn.push({
                        action: 'withdraw',
                        args: [container.id,mineral[0].mineralType],
                        pos: container.pos
                    })
                } else {
                    room.memory._typed._static.T_cntn.push({
                        action: 'transfer',
                        args: [container.id,'energy'],
                        pos: container.pos
                    })
                }
            }
        }
    },

    sources: function (room:Room) {
        room.memory._typed._static.H_srcs = []
        var T_srcs: Posed<RestrictedPrimitiveDescript<'transfer'|'repair','energy'>>[][] = [[],[],[]]
        const sources = room.find(FIND_SOURCES)
        for(let i in sources) {
            const source = sources[i]
            room.memory._typed._static.H_srcs.push({
                action: 'harvest',
                args: [source.id],
                pos: source.pos
            })
            
            const near_structs:AnyStoreStructure[] = source.pos.findInRange(FIND_STRUCTURES,2,{
                filter: (structure) => {
                    if(structure.structureType == STRUCTURE_CONTAINER){
                        if(structure.pos.inRangeTo(source,2))
                            T_srcs[i].push({action: 'repair',args: [structure.id],pos: structure.pos})
                        return true
                    }
                    if(structure.structureType == STRUCTURE_STORAGE
                        || structure.structureType == STRUCTURE_TERMINAL
                        || structure.structureType == STRUCTURE_LINK)
                        return true
                    return false
                }
            })
            near_structs.sort((a, b) => {
                return a.store.getCapacity('energy') - b.store.getCapacity('energy')
                    - a.pos.getRangeTo(source) + b.pos.getRangeTo(source)
            })
            for(let struct of near_structs){
                T_srcs[i].push({action:'transfer',args:[struct.id,'energy'],pos:struct.pos})
            }
        }
        room.memory._typed._static.T_src0 = T_srcs[0]
        room.memory._typed._static.T_src1 = T_srcs[1]
        room.memory._typed._static.T_src2 = T_srcs[2]
    },

    mineral: function (room:Room) {
        room.memory._typed._static.H_mnrl = []
        const mineral = room.find(FIND_MINERALS,{
            filter: (mineral) => mineral.mineralAmount > 0
                && room.storage && room.storage.store[mineral.mineralType] < 60000
        })[0]
        if(!mineral) return
        const extractor:StructureExtractor|null = mineral.pos.findClosestByRange(FIND_MY_STRUCTURES,
                {filter: {structureType: STRUCTURE_EXTRACTOR}})
        const container:StructureContainer|null = mineral.pos.findClosestByRange(FIND_STRUCTURES,
                {filter: {structureType: STRUCTURE_CONTAINER}})
        if(!extractor || !container || !container.pos.isNearTo(mineral) || container.store.getFreeCapacity() == 0)
            return
        
        room.memory._typed._static.H_mnrl = [{action:'harvest',args:[mineral.id],pos: mineral.pos}]
        room.memory._typed._static.T_mnrl = [{action:'transfer',args:[container.id,mineral.mineralType],pos:container.pos}]
    },

    controller: function (room:Room) {
        room.memory._typed._static.W_ctrl = []
        room.memory._typed._static.U_ctrl = []
        const controller = room.controller
        if(!controller || !controller.my) return
        room.memory._typed._static.U_ctrl = [{action:'upgradeController',args:[controller.id],pos:controller.pos}]

        const energy_structs: AnyStoreStructure[] = controller.pos.findInRange(FIND_STRUCTURES,3,{
            filter: structure => structure.structureType == STRUCTURE_CONTAINER
                || structure.structureType == STRUCTURE_STORAGE
                || structure.structureType == STRUCTURE_TERMINAL
                || structure.structureType == STRUCTURE_LINK
        })
        if(!energy_structs[0]) return
        energy_structs.sort((a, b) => a.store.getCapacity('energy') - b.store.getCapacity('energy'))
        for(let struct of energy_structs){
            room.memory._typed._static.W_ctrl.push({action:'withdraw',args:[struct.id,'energy'],pos:struct.pos})
        }
    },
}

_.assign(global, {static_updater:static_updater})