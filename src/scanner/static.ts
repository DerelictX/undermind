import _ from "lodash"

export const static_updater = {
    sources: function (room:Room,pool:Partial<StaticTaskPool>) {
        pool.H_srcs = []
        var T_srcs: Posed<RestrictedPrimitiveDescript<'transfer'|'repair','energy'>>[][] = [[],[],[]]
        const sources = room.find(FIND_SOURCES)
        for(let i in sources) {
            const source = sources[i]
            pool.H_srcs.push({
                action: 'harvest',
                args: [source.id],
                pos: source.pos
            })
            const container:StructureContainer|null = source.pos.findClosestByRange(FIND_STRUCTURES,{
                filter: {structureType: STRUCTURE_CONTAINER}
            })
            if(!container || !container.pos.isNearTo(source)) continue
            T_srcs[i].push({
                action: 'repair',
                args: [container.id],
                pos: container.pos
            })
            
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
                T_srcs[i].push({action:'transfer',args:[struct.id,'energy'],pos:struct.pos})
            }
        }
        pool.T_src0 = T_srcs[0]
        pool.T_src1 = T_srcs[1]
        pool.T_src2 = T_srcs[2]
    },

    mineral: function (room:Room,pool:Partial<StaticTaskPool>) {
        pool.H_mnrl = []
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
        
        pool.H_mnrl = [{action:'harvest',args:[mineral.id],pos: mineral.pos}]
        pool.T_mnrl = [{action:'transfer',args:[container.id,mineral.mineralType],pos:container.pos}]
    },

    controller: function (room:Room,pool:Partial<StaticTaskPool>) {
        pool.W_ctrl = []
        pool.U_ctrl = []
        const controller = room.controller
        if(!controller || !controller.my) return
        pool.U_ctrl = [{action:'upgradeController',args:[controller.id],pos:controller.pos}]

        const energy_structs: AnyStoreStructure[] = controller.pos.findInRange(FIND_STRUCTURES,3,{
            filter: structure => structure.structureType == STRUCTURE_CONTAINER
                || structure.structureType == STRUCTURE_STORAGE
                || structure.structureType == STRUCTURE_TERMINAL
                || structure.structureType == STRUCTURE_LINK
        })
        if(!energy_structs[0]) return
        energy_structs.sort((a, b) => a.store.getCapacity('energy') - b.store.getCapacity('energy'))
        for(let struct of energy_structs){
            pool.W_ctrl.push({action:'withdraw',args:[struct.id,'energy'],pos:struct.pos})
        }
    },
}

_.assign(global, {static_updater:static_updater})