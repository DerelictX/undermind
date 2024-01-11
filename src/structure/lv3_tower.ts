export const tower_run = function (room: Room) {
    const towers = room.memory.towers;
    if (!towers) return
    let tower: StructureTower | null = Game.getObjectById(towers[0]);
    if (!tower) return

    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (!closestHostile) return

    for (let id in towers) {
        tower = Game.getObjectById(towers[id]);
        if (tower) tower.attack(closestHostile);
    }
}

export const T_tower = function (room: Room): RestrictedPrimitiveDescript<'transfer', 'energy'>[] {
    if (!room.memory.towers) return []
    const tasks: RestrictedPrimitiveDescript<'transfer', 'energy'>[] = [];
    const towers = room.memory.towers
        .map(id => Game.getObjectById(id))
        .filter(s => s && s.store.getFreeCapacity('energy') >= 400)
    for (let tower of towers) {
        if (!tower)
            continue
        tasks.push({
            action: 'transfer',
            args: [tower.id, 'energy', tower.store.getFreeCapacity('energy')],
            pos: tower.pos
        })
    }
    return tasks
}