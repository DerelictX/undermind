import { T_fact, W_fact } from "@/structure/factory"
import { compound, T_boost, T_react } from "@/structure/lab"
import { T_nuker, T_power } from "@/structure/power_spawn"
import { T_term, W_term } from "@/structure/terminal"

export const posed_task_updater: TaskUpdater<DynamicTaskPool> = {
    /**
     * 从container取所有类型资源
     * @param room
     * @returns
     */
    W_cntn: function (room: Room) {
        if (!room.memory._typed._static.W_cntn)
            return []
        var tasks: Posed<PrimitiveDescript<'withdraw'>>[] = []
        for (let task of room.memory._typed._static.W_cntn) {
            const container = Game.getObjectById(task.args[0])
            if (!container || container.store.getFreeCapacity('energy') > 800)
                continue
            var store: StorePropertiesOnly = container.store
            var resourceType: keyof typeof store
            for (resourceType in store) {
                tasks.push({
                    action: 'withdraw',
                    args: [container.id, resourceType],
                    pos: container.pos
                })
            }
        }
        return tasks
    },
    W_link: function (room: Room) {
        if (room.memory._typed._type != 'owned')
            return []
        const nexus = room.memory._typed._struct.links.nexus
            .map(id => Game.getObjectById(id))[0]
        if (!nexus || nexus.store['energy'] < 600)
            return []
        return [{
            action: 'withdraw',
            args: [nexus.id, 'energy'],
            pos: nexus.pos
        }]
    },
    /**
     * 从敌方建筑抢资源
     * @param room
     * @returns
     */
    loot: function (room: Room) {
        var tasks: PosedCreepTask<"withdraw">[] = []
        const hostile_stores: (AnyStoreStructure & AnyOwnedStructure)[] = room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType == STRUCTURE_STORAGE
                    || structure.structureType == STRUCTURE_TERMINAL)
                    return structure.store.getUsedCapacity() > 0
                return false
            }
        })
        for (let hostile_store of hostile_stores) {
            var store: StorePropertiesOnly = hostile_store.store
            var resourceType: keyof typeof store
            for (resourceType in store) {
                tasks.push({
                    action: 'withdraw',
                    args: [hostile_store.id, resourceType, hostile_store.store[resourceType]],
                    pos: hostile_store.pos
                })
            }
        }
        return tasks
    },
    /**
     * 清扫墓碑和废墟
     * @param room
     * @returns
     */
    sweep: function (room: Room) {
        var tasks: PosedCreepTask<"withdraw" | "pickup">[] = []
        const tombstones: Tombstone[] = room.find(FIND_TOMBSTONES, {
            filter: (tombstone) => {
                if (tombstone.store.getUsedCapacity() >= 200)
                    return true
                if (tombstone.creep.owner.username == 'Invader')
                    return false
                if (tombstone.store.getUsedCapacity() > tombstone.store['energy'])
                    return true
                return false
            }
        })
        for (let tombstone of tombstones) {
            var store: StorePropertiesOnly = tombstone.store
            var resourceType: keyof typeof store
            for (resourceType in store) {
                tasks.push({
                    action: 'withdraw',
                    args: [tombstone.id, resourceType, tombstone.store[resourceType]],
                    pos: tombstone.pos
                })
            }
        }

        const ruins: Ruin[] = room.find(FIND_RUINS, {
            filter: (ruin) => {
                return ruin.store.getUsedCapacity() > 0
            }
        })
        for (let ruin of ruins) {
            var store: StorePropertiesOnly = ruin.store
            var resourceType: keyof typeof store
            for (resourceType in store) {
                tasks.push({
                    action: 'withdraw',
                    args: [ruin.id, resourceType, ruin.store[resourceType]],
                    pos: ruin.pos
                })
            }
        }

        const dropped: Resource[] = room.find(FIND_DROPPED_RESOURCES, {
            filter: (resource) => {
                return resource.amount > 600
            }
        })
        for (let resource of dropped) {
            tasks.push({
                action: 'pickup',
                args: [resource.id],
                pos: resource.pos
            })
        }
        return tasks
    },
    recycle: function (room: Room): PosedCreepTask<"dismantle">[] {
        return []
    },

    H_srcs: function (room: Room) {
        if (!room.memory._typed._static.H_srcs)
            return []
        var tasks: Posed<RestrictedPrimitiveDescript<'harvest', 'energy'>>[] = []
        for (let task of room.memory._typed._static.H_srcs) {
            if (Game.getObjectById(task.args[0])?.energy)
                tasks.push(task)
        }
        return tasks
    },
    H_src0: function (room: Room) {
        const task = room.memory._typed._static.H_srcs?.[0]
        if (!task)
            return []
        if (Game.getObjectById(task.args[0])?.energy)
            return [task]
        return []
    },
    H_src1: function (room: Room) {
        const task = room.memory._typed._static.H_srcs?.[1]
        if (!task)
            return []
        if (Game.getObjectById(task.args[0])?.energy)
            return [task]
        return []
    },
    H_src2: function (room: Room) {
        if (!room.memory._typed._static.H_srcs?.[2])
            return []
        return [room.memory._typed._static.H_srcs[2]].slice()
    },

    W_energy: function (room: Room) {
        var tasks: Posed<RestrictedPrimitiveDescript<'withdraw' | 'pickup', 'energy'>>[] = []
        const storage = room.storage
        if (storage && storage.store['energy'] >= 10000) {
            tasks.push({
                action: 'withdraw',
                args: [storage.id, 'energy'],
                pos: storage.pos
            })
        }
        if (tasks.length)
            return tasks

        if (room.memory._typed._static.W_cntn) {
            for (let task of room.memory._typed._static.W_cntn) {
                const container = Game.getObjectById(task.args[0])
                if (container && container.store['energy'] >= 800) {
                    tasks.push({
                        action: 'withdraw',
                        args: [container.id, 'energy'],
                        pos: container.pos
                    })
                }
            }
        }
        if (room.memory._typed._type == 'owned') {
            const links = room.memory._typed._struct.links.outs
                .map(id => Game.getObjectById(id))
            for (let link of links) {
                if (link && link.store['energy'] >= 600) {
                    tasks.push({
                        action: 'withdraw',
                        args: [link.id, 'energy'],
                        pos: link.pos
                    })
                }
            }
        }
        if (tasks.length)
            return tasks

        const dropped: Resource<'energy'>[] = room.find(FIND_DROPPED_RESOURCES, {
            filter: (resource) => {
                return resource.resourceType == 'energy' && resource.amount > 200
            }
        })
        for (let resource of dropped) {
            tasks.push({
                action: 'pickup',
                args: [resource.id],
                pos: resource.pos
            })
        }
        return tasks
    },
    W_ctrl: function (room: Room) {
        if (room.memory._typed._type != 'owned')
            return []
        for (let task of room.memory._typed._static.W_ctrl) {
            const structure = Game.getObjectById(task.args[0])
            if (structure && structure.store.getUsedCapacity(task.args[1]) >= 50)
                return [task]
        }
        return []
    },

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
        if (room.memory._typed._type != 'owned')
            return []
        var tasks: PosedCreepTask<"repair">[] = []
        var wallHits = room.memory._typed._struct.wall_hits
        let walls = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.hits > structure.hitsMax - 10000)
                    return false
                if (structure.structureType == STRUCTURE_RAMPART)
                    return structure.my
                if (structure.structureType == STRUCTURE_WALL)
                    return true
                return false
            }
        })
        if (!walls.length)
            return []

        for (let wall of walls) {
            if (wall.hits <= wallHits) {
                if (wall.hits < wallHits * 0.9)
                    wallHits *= 0.95
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
            room.memory._typed._struct.wall_hits = wallHits
        }
        return tasks
    },

    anti_nuke: function (room: Room) {
        const nukes = room.find(FIND_NUKES)
        return []
    },

    downgraded: function (room: Room) {
        const downgraded = room.controller
        if (downgraded && downgraded.my && !downgraded.upgradeBlocked) {
            if (downgraded.ticksToDowngrade < CONTROLLER_DOWNGRADE[downgraded.level] - 8000) {
                return [{
                    action: 'upgradeController',
                    args: [downgraded.id],
                    pos: downgraded.pos
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
    T_ext: function (room: Room): Posed<RestrictedPrimitiveDescript<'transfer', 'energy'>>[] {
        var tasks: Posed<RestrictedPrimitiveDescript<'transfer', 'energy'>>[] = []
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
    T_tower: function (room: Room): Posed<RestrictedPrimitiveDescript<'transfer', 'energy'>>[] {
        if (room.memory._typed._type != 'owned')
            return []
        var tasks: Posed<RestrictedPrimitiveDescript<'transfer', 'energy'>>[] = []
        const towers = room.memory._typed._struct.towers
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
    },
    T_cntn: function (room: Room): Posed<RestrictedPrimitiveDescript<'transfer', 'energy'>>[] {
        if (!room.memory._typed._static.W_cntn)
            return []
        var tasks: Posed<RestrictedPrimitiveDescript<'transfer', 'energy'>>[] = []
        for (let task of room.memory._typed._static.T_cntn) {
            const container = Game.getObjectById(task.args[0])
            if (container && container.store.getFreeCapacity('energy') >= 1000)
                tasks.push(task)
        }
        return tasks
    },
    T_src0: function (room: Room) {
        if (!room.memory._typed._static.T_src0)
            return []
        for (let task of room.memory._typed._static.T_src0) {
            if (task.action == 'build') {
                const structure = Game.getObjectById(task.args[0])
                if (structure)
                    return [task]
            }
            if (task.action == 'repair') {
                const structure = Game.getObjectById(task.args[0])
                if (structure && structure.hits < structure.hitsMax)
                    return [task]
            }
            if (task.action == 'transfer') {
                const structure = Game.getObjectById(task.args[0])
                if (structure && structure.store.getFreeCapacity(task.args[1]))
                    return [task]
            }
        }
        return []
    },
    T_src1: function (room: Room) {
        if (!room.memory._typed._static.T_src1)
            return []
        for (let task of room.memory._typed._static.T_src1) {
            if (task.action == 'build') {
                const structure = Game.getObjectById(task.args[0])
                if (structure)
                    return [task]
            }
            if (task.action == 'repair') {
                const structure = Game.getObjectById(task.args[0])
                if (structure && structure.hits < structure.hitsMax)
                    return [task]
            }
            if (task.action == 'transfer') {
                const structure = Game.getObjectById(task.args[0])
                if (structure && structure.store.getFreeCapacity(task.args[1]))
                    return [task]
            }
        }
        return []
    },
    T_src2: function (room: Room) {
        if (!room.memory._typed._static.T_src2)
            return []
        for (let task of room.memory._typed._static.T_src2) {
            if (task.action == 'repair') {
                const structure = Game.getObjectById(task.args[0])
                if (structure && structure.hits < structure.hitsMax)
                    return [task]
            }
            if (task.action == 'transfer') {
                const structure = Game.getObjectById(task.args[0])
                if (structure && structure.store.getFreeCapacity(task.args[1]))
                    return [task]
            }
        }
        return []
    },
    T_boost: T_boost,
    T_react: T_react,
    compound: compound,
    T_power: T_power,
    T_nuker: T_nuker,
    gen_safe: function (room: Room): PosedCreepTask<"generateSafeMode">[] {
        const controller = room.controller
        if (controller && controller.my && controller.level > 3 && controller.safeModeAvailable == 0) {
            return [{
                action: 'generateSafeMode',
                args: [controller.id],
                pos: controller.pos
            }]
        }

        else
            return []
    },
    T_term: T_term,
    W_term: W_term,
    T_fact: T_fact,
    W_fact: W_fact
}