import _ from "lodash"

const init_harvester = function (pos: RoomPosition): StaticMemory {
    const ret: StaticMemory = {
        bhvr_name: "static",
        state: "collect",
        collect: [],
        consume: [],
        buff_in: [],
        buff_out: []
    }

    const sources = pos.findInRange(FIND_SOURCES, 1)
    const sites = pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 3)
    const container: StructureContainer[] = pos.findInRange(FIND_STRUCTURES, 1, {
        filter: (structure) => structure.structureType == 'container'
    })
    const link: StructureLink[] = pos.findInRange(FIND_MY_STRUCTURES, 1, {
        filter: (structure) => structure.structureType == 'link'
    })

    sources.forEach(s => ret.collect.push({
        action: 'harvest', args: [s.id], pos: s.pos
    }))
    container.forEach(s => {
        ret.consume.push({
            action: 'repair', args: [s.id], pos: s.pos
        })
        ret.buff_in?.push({
            action: 'withdraw', args: [s.id, 'energy'], pos: s.pos
        })
        ret.buff_out?.push({
            action: 'transfer', args: [s.id, 'energy'], pos: s.pos
        })
    })
    sites.forEach(s => ret.consume.push({
        action: 'build', args: [s.id], pos: s.pos
    }))

    link.sort((a, b) => {
        return a.store.getCapacity('energy') - b.store.getCapacity('energy')
            - a.pos.getRangeTo(pos) + b.pos.getRangeTo(pos)
    })
    link.forEach(s => ret.consume.push({
        action: 'transfer', args: [s.id, 'energy'], pos: s.pos
    }))
    return ret
}