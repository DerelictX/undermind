export const link_run = function(room: Room){
    if(room.memory._typed._type != 'owned') return
    const links_in = room.memory._typed._struct.links.ins.map(id => Game.getObjectById(id))
    const links_out = room.memory._typed._struct.links.outs.map(id => Game.getObjectById(id))
    const link_nexus = room.memory._typed._struct.links.nexus.map(id => Game.getObjectById(id))

    const link_from = links_in.find(link => link && link.cooldown == 0 && link.store['energy'] >= 200)
    const link_to = links_out.concat(link_nexus).find(link => link && link.store['energy'] < 600)
    if(link_from && link_to) link_from.transferEnergy(link_to)
}