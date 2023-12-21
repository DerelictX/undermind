import {T_tower} from "@/structure/lv3_tower"
import {T_boost, T_react} from "@/structure/lv6_lab"
import {T_term} from "@/structure/lv6_terminal"
import {T_fact} from "@/structure/lv7_factory"
import {T_nuker, T_power} from "@/structure/lv8_power_spawn"

export const update_con_cache = function <T extends keyof ConsumeTaskCache>
(pool: Partial<ConsumeTaskCache>, key: T, room: Room) {
    pool[key] = consume_cache_updater[key](room)
}

const consume_cache_updater: {
    [P in keyof ConsumeTaskCache]: (room: Room) => ConsumeTaskCache[P]
} = {
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
        var wallHits = room.memory.wall_hits
        if (!wallHits) return []
        var tasks: PosedCreepTask<"repair">[] = []
        let walls = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.hits > structure.hitsMax - 10000)
                    return false
                if (structure.structureType == STRUCTURE_RAMPART)
                    return structure.my
                if (structure.structureType == STRUCTURE_WALL)
                    return structure.hits != undefined
                return false
            }
        })
        if (!walls.length)
            return []

        for (let wall of walls) {
            if (wall.hits <= wallHits) {
                if (wall.hits < wallHits * 0.9)
                    wallHits *= 0.9
                tasks.push({
                    action: 'repair',
                    args: [wall.id],
                    pos: wall.pos
                })
            }
        }
        if (!tasks.length) {
            wallHits = walls[0].hits + 10000
            tasks.push({
                action: 'repair',
                args: [walls[0].id],
                pos: walls[0].pos
            })
        }

        if (wallHits >= 100000 && wallHits <= 100000000) {
            room.memory.wall_hits = wallHits
        }
        return tasks
    },
    anti_nuke: function (room: Room) {
        const nukes = room.find(FIND_NUKES)
        return []
    },
    downgraded: function (room: Room) {
        const controller = room.controller
        if (controller && controller.my && !controller.upgradeBlocked) {
            if (controller.ticksToDowngrade < CONTROLLER_DOWNGRADE[controller.level] * 0.75) {
                return [{
                    action: 'upgradeController',
                    args: [controller.id],
                    pos: controller.pos
                }]
            }
        }
        return []
    },
    U_ctrl: function (room: Room) {
        const controller = room.controller
        if (controller && controller.my && !controller.upgradeBlocked) {
            return [{
                action: 'upgradeController',
                args: [controller.id],
                pos: controller.pos
            }]
        }
        return []
    },

    T_ext: function (room: Room): RestrictedPrimitiveDescript<'transfer', 'energy'>[] {
        var tasks: RestrictedPrimitiveDescript<'transfer', 'energy'>[] = []
        if (room.energyAvailable == room.energyCapacityAvailable)
            return []
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
    T_cntn: function (room: Room): RestrictedPrimitiveDescript<'transfer', 'energy'>[] {
        const T_cntn = Memory.T_cntn[room.name]
        if (!T_cntn) return []
        var tasks: RestrictedPrimitiveDescript<'transfer', 'energy'>[] = []
        for (let id of T_cntn) {
            const container = Game.getObjectById(id)
            if (container && container.store.getFreeCapacity('energy') >= 1000)
                tasks.push({action: 'transfer', args: [id, 'energy'], pos: container.pos})
        }
        return tasks
    },
    T_tower: T_tower,
    T_boost: T_boost,
    T_react: T_react,
    T_power: T_power,
    T_nuker: T_nuker,
    T_term: T_term,
    T_fact: T_fact
}