export const init_harvester = function(pos:RoomPosition): StaticMemory{
    const ret: StaticMemory = {
        bhvr_name: "static",
        state: "collect",
        collect: [],
        consume: [],
        buff_in: [],
        buff_out: []
    }

    const sources = pos.findInRange(FIND_SOURCES,1)
    const sites = pos.findInRange(FIND_MY_CONSTRUCTION_SITES,3)
    const container: StructureContainer[] = pos.findInRange(FIND_STRUCTURES,1,{
        filter: (structure) => structure.structureType == 'container'
    })
    const link: StructureLink[] = pos.findInRange(FIND_MY_STRUCTURES,1,{
        filter: (structure) => structure.structureType == 'link'
    })

    sources.forEach(s => ret.collect.push({bhvr_name:'callbackful',action: 'harvest',args: [s.id]}))
    container.forEach(s => {
        ret.consume.push({bhvr_name:'callbackful',action: 'repair',args: [s.id]})
        ret.buff_in.push({bhvr_name:'callbackful',action:'withdraw',args:[s.id,'energy']})
        ret.buff_out.push({bhvr_name:'callbackful',action:'transfer',args:[s.id,'energy']})
    })
    sites.forEach(s => ret.consume.push({bhvr_name:'callbackful',action: 'build',args: [s.id]}))
    
    link.sort((a, b) => {
        return a.store.getCapacity('energy') - b.store.getCapacity('energy')
            - a.pos.getRangeTo(pos) + b.pos.getRangeTo(pos)
    })
    link.forEach(s => ret.consume.push({bhvr_name:'callbackful',action:'transfer',args:[s.id,'energy']}))
    return ret
}