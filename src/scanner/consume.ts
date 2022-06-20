const consume_updater: TaskUpdater<ConsumeController> = {
    build: function (room: Room) {
        var tasks: CachedRoomTasks<"build"> = []
        const sites = room.find(FIND_MY_CONSTRUCTION_SITES)
        sites.forEach(s => tasks.push({
            action: 'build',
            args: [s.id],
            pos: s.pos
        }))
        return tasks
    },
    repair: function (room: Room) {
        var tasks: CachedRoomTasks<"repair"> = []
        const damaged = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType == STRUCTURE_RAMPART)
                    return structure.hits < 10000
                return structure.hits < structure.hitsMax
            }
        })
        damaged.forEach(s => tasks.push({
            action: 'repair',
            args: [s.id],
            pos: s.pos
        }))
        return tasks
    },

    decayed: function (room: Room) {
        var tasks: CachedRoomTasks<"repair"> = []
        const decayed = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType == STRUCTURE_ROAD)
                    return structure.hits < structure.hitsMax - 1500
                if (structure.structureType == STRUCTURE_CONTAINER)
                    return structure.hits < 200000
                return false
            }
        })
        decayed.forEach(s => tasks.push({
            action: 'repair',
            args: [s.id],
            pos: s.pos
        }))
        return tasks
    },

    fortify: function (room: Room) {
        var tasks: CachedRoomTasks<"repair"> = []
        var wallHits = room.memory.structures.wall_hits - 1000
        let walls = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.hits > structure.hitsMax - 10000)
                    return false
                if (structure.structureType == STRUCTURE_RAMPART)
                    return structure.hits < wallHits && structure.my
                if (structure.structureType == STRUCTURE_WALL)
                    return structure.hits < wallHits
                return false
            }
        })
        walls.forEach(s => tasks.push({
            action: 'repair',
            args: [s.id],
            pos: s.pos
        }))
        if (walls.find(s => s.hits < wallHits * 0.9))
            wallHits * 0.95
        if (!walls.length)
            wallHits += 30000
        if (wallHits >= 100000 && wallHits <= 100000000)
            room.memory.structures.wall_hits = wallHits
        return tasks
    },

    anti_nuke: function (room: Room) {
        const nukes = room.find(FIND_NUKES)
        return []
    },

    downgraded: function (room: Room) {
        var tasks: CachedRoomTasks<"upgradeController"> = []
        const downgraded = room.controller
        if (downgraded && downgraded.my && !downgraded.upgradeBlocked) {
            if (downgraded.ticksToDowngrade < CONTROLLER_DOWNGRADE[downgraded.level] - 8000)
                tasks.push({
                    action: 'upgradeController',
                    args: [downgraded.id],
                    pos: downgraded.pos
                })
        }
        return tasks
    },
    upgrade: function (room: Room) {
        var tasks: CachedRoomTasks<"upgradeController"> = []
        const controller = room.controller
        if (controller && controller.my && !controller.upgradeBlocked) {
            if (controller.level < 8)
                tasks.push({
                    action: 'upgradeController',
                    args: [controller.id],
                    pos: controller.pos
                })
        }
        return tasks
    },

    extension: function (room: Room) {
        var tasks: CachedRoomTasks<'transfer'> = []
        const extensions: (AnyStoreStructure & AnyOwnedStructure)[] = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType == STRUCTURE_EXTENSION
                    || structure.structureType == STRUCTURE_SPAWN)
                    return structure.store.getFreeCapacity('energy') > 0
                return false
            }
        })
        for (let extension of extensions) {
            if (!extension)
                continue
            tasks.push({
                action: 'transfer',
                args: [extension.id, 'energy', extension.store.getFreeCapacity('energy')],
                pos: extension.pos
            })
        }
        return tasks
    },

    tower: function (room: Room) {
        var tasks: CachedRoomTasks<'transfer'> = []
        const towers = room.memory.structures.towers
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
        return []
    },
    buffer: function (room: Room) {
        return []
    }
}