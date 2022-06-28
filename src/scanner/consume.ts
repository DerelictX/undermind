import { reactions } from "@/structure/lab"

export const consume_updater: TaskUpdater<ConsumeTaskPool> = {
    build: function (room: Room) {
        var tasks: PosedCreepTask<"build">[] = []
        const sites = room.find(FIND_MY_CONSTRUCTION_SITES)
        sites.forEach(s => tasks.push({
            action: 'build',
            args: [s.id],
            pos: s.pos
        }))
        return tasks
    },

    repair: function (room: Room) {
        var tasks: PosedCreepTask<"repair">[] = []
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
        var tasks: PosedCreepTask<"repair">[] = []
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
        var tasks: PosedCreepTask<"repair">[] = []
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
        var tasks: PosedCreepTask<"upgradeController">[] = []
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

    U_ctrl: function (room: Room) {
        var tasks: PosedCreepTask<"upgradeController">[] = []
        const controller = room.controller
        if (controller && controller.my && !controller.upgradeBlocked) {
            tasks.push({
                action: 'upgradeController',
                args: [controller.id],
                pos: controller.pos
            })
        }
        return tasks
    },
    R_src0: function (room: Room): PosedCreepTask<"repair">[] {
        throw new Error("Function not implemented.")
    },
    R_src1: function (room: Room): PosedCreepTask<"repair">[] {
        throw new Error("Function not implemented.")
    },
    R_src2: function (room: Room): PosedCreepTask<"repair">[] {
        throw new Error("Function not implemented.")
    }
}