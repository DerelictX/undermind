const consume_updater: TaskUpdater<ConsumeController> = {
    
    build: function (tasks: CachedRoomTasks<"build">, room: Room): void {
        const sites = room.find(FIND_MY_CONSTRUCTION_SITES)
        sites.forEach(s => tasks.push({
            action: 'build',
            args: [s.id],
            pos: s.pos
        }))
    },
    repair: function (tasks: CachedRoomTasks<"repair">, room: Room): void {
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
    },

    maintain: function (tasks: CachedRoomTasks<"repair" | "upgradeController">, room: Room): void {
        const downgraded = room.controller
        if (downgraded && downgraded.my && !downgraded.upgradeBlocked) {
            if (downgraded.ticksToDowngrade < CONTROLLER_DOWNGRADE[downgraded.level] - 8000)
                tasks.push({
                    action: 'upgradeController',
                    args: [downgraded.id],
                    pos: downgraded.pos
                })
        }

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
    },

    fortifer: function (tasks: CachedRoomTasks<"repair">, room: Room): void {
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
    },

    anti_nuke: function (tasks: CachedRoomTasks<"repair">, room: Room): void {
        const nukes = room.find(FIND_NUKES)
    }
}