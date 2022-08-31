import { reactions } from "@/structure/lab"

export const posed_task_updater: TaskUpdater<DynamicTaskPool> = {
    /**
     * 从container取所有类型资源
     * @param room
     * @returns
     */
    W_cntn: function (room: Room) {
        if (!room.memory._typed._static.W_cntn) return []
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
        const nexus = room.memory._typed._struct?.links.nexus
            .map(id => Game.getObjectById(id))[0]
        if (!nexus || nexus.store['energy'] < 600) return []
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
        var tasks: PosedCreepTask<"withdraw">[] = []
        const tombstones: Tombstone[] = room.find(FIND_TOMBSTONES, {
            filter: (tombstone) => {
                return tombstone.store.getUsedCapacity() >= 200
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
        return tasks
    },
    /**
     * 收集反应产物
     * @param room
     * @returns
     */
    compound: function (room: Room) {
        if (!room.memory._typed._struct) return []
        var tasks: PosedCreepTask<"withdraw">[] = []
        const labs = room.memory._typed._struct?.labs
        const compoundType = labs.reaction
        if (!compoundType) return []

        for (let i in labs.outs) {
            const boostType: MineralBoostConstant | undefined = labs.boosts[i]
            const lab_out = Game.getObjectById(labs.outs[i])
            if (!lab_out)
                continue

            if (boostType) {
                if (lab_out.mineralType && boostType != lab_out.mineralType) {
                    tasks.push({
                        action: 'withdraw',
                        args: [lab_out.id, lab_out.mineralType, lab_out.store[lab_out.mineralType]],
                        pos: lab_out.pos
                    })
                }
            } else {
                if (lab_out.mineralType && (compoundType != lab_out.mineralType
                    || lab_out.store[compoundType] >= 600)) {
                    tasks.push({
                        action: 'withdraw',
                        args: [lab_out.id, lab_out.mineralType, lab_out.store[lab_out.mineralType]],
                        pos: lab_out.pos
                    })
                }
            }
        }
        return tasks
    },
    recycle: function (room: Room): PosedCreepTask<"dismantle">[] {
        return []
    },

    H_srcs: function (room: Room) {
        if (!room.memory._typed._static.H_srcs) return []
        var tasks: Posed<RestrictedPrimitiveDescript<'harvest', 'energy'>>[] = []
        for (let task of room.memory._typed._static.H_srcs) {
            if (Game.getObjectById(task.args[0])?.energy)
                tasks.push(task)
        }
        return tasks
    },
    H_src0: function (room: Room) {
        if (!room.memory._typed._static.H_srcs?.at(0)) return []
        return [room.memory._typed._static.H_srcs[0]].slice()
    },
    H_src1: function (room: Room) {
        if (!room.memory._typed._static.H_srcs?.at(1)) return []
        return [room.memory._typed._static.H_srcs[1]].slice()
    },
    H_src2: function (room: Room) {
        if (!room.memory._typed._static.H_srcs?.at(2)) return []
        return [room.memory._typed._static.H_srcs[2]].slice()
    },
    H_mnrl: function (room: Room) {
        if (!room.memory._typed._static.H_mnrl) return []
        return room.memory._typed._static.H_mnrl.slice()
    },

    W_energy: function (room: Room) {
        var tasks: Posed<RestrictedPrimitiveDescript<'withdraw', 'energy'>>[] = []
        const storage = room.storage
        if (storage && storage.store['energy'] >= 10000) {
            tasks.push({
                action: 'withdraw',
                args: [storage.id, 'energy'],
                pos: storage.pos
            })
        }
        if (!room.memory._typed._static.W_cntn) return tasks
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
        if (!room.memory._typed._struct) return tasks
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
        return tasks
    },
    W_ctrl: function (room: Room) {
        if (!room.memory._typed._static.W_ctrl) return []
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
        if (!room.memory._typed._struct) return []
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
        if (!walls.length) return []

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
        if (!tasks.length)
            wallHits += 100000

        if (wallHits >= 100000 && wallHits <= 100000000) {
        }
        room.memory._typed._struct.wall_hits = wallHits
        return tasks
    },

    anti_nuke: function (room: Room) {
        const nukes = room.find(FIND_NUKES)
        return []
    },

    downgraded: function (room: Room) {
        const downgraded = room.controller
        if (downgraded && downgraded.my && !downgraded.upgradeBlocked) {
            if (downgraded.ticksToDowngrade < CONTROLLER_DOWNGRADE[downgraded.level] - 8000){
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
        if (room.energyAvailable == room.energyCapacityAvailable) return []
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
        if (!room.memory._typed._struct) return []
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
        if (!room.memory._typed._static.W_cntn) return []
        var tasks: Posed<RestrictedPrimitiveDescript<'transfer', 'energy'>>[] = []
        for (let task of room.memory._typed._static.T_cntn) {
            const container = Game.getObjectById(task.args[0])
            if (container && container.store.getFreeCapacity('energy') >= 1000)
                tasks.push(task)
        }
        return tasks
    },
    T_src0: function (room: Room) {
        if (!room.memory._typed._static.T_src0) return []
        for (let task of room.memory._typed._static.T_src0) {
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
        if (!room.memory._typed._static.T_src1) return []
        for (let task of room.memory._typed._static.T_src1) {
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
        if (!room.memory._typed._static.T_src2) return []
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
    T_mnrl: function (room: Room) {
        if (!room.memory._typed._static.T_mnrl) return []
        return room.memory._typed._static.T_mnrl.slice()
    },
    T_boost: function (room: Room): PosedCreepTask<"transfer">[] {
        if (!room.memory._typed._struct) return []
        const labs = room.memory._typed._struct.labs
        var tasks: PosedCreepTask<'transfer'>[] = []
        for (let i in labs.outs) {
            const boostType: MineralBoostConstant | undefined = labs.boosts[i]
            const lab_out = Game.getObjectById(labs.outs[i])
            if (!lab_out)
                continue

            if (boostType && lab_out.store.getFreeCapacity(boostType) >= 1800) {
                tasks.push({
                    action: 'transfer',
                    args: [lab_out.id, boostType, 1200],
                    pos: lab_out.pos
                })
            }
            if (lab_out.store['energy'] <= 1200) {
                tasks.push({
                    action: 'transfer',
                    args: [lab_out.id, 'energy', 800],
                    pos: lab_out.pos
                })
            }
        }
        return tasks
    },
    T_react: function (room: Room): PosedCreepTask<"transfer">[] {
        if (!room.memory._typed._struct) return []
        const labs = room.memory._typed._struct.labs
        const compoundType = labs.reaction
        if (!compoundType) return []
        var tasks: PosedCreepTask<'transfer'>[] = []
        for (let i in labs.ins) {
            const reactantType = reactions[compoundType][i]
            const lab_in = Game.getObjectById(labs.ins[i])
            if (!lab_in)
                continue

            //reactant
            if (lab_in.store.getFreeCapacity(reactantType) > 2400) {
                tasks.push({
                    action: 'transfer',
                    args: [lab_in.id, reactantType, 400],
                    pos: lab_in.pos
                })
            }
        }
        return tasks
    },
    T_power: function (room: Room): PosedCreepTask<"transfer">[] {
        if (!room.memory._typed._struct?.power_spawn) return []
        const power_spawn = Game.getObjectById(room.memory._typed._struct.power_spawn)
        if (!power_spawn) return []
        var tasks: PosedCreepTask<'transfer'>[] = []
        if (power_spawn.store['energy'] <= 3000) {
            tasks.push({
                action: 'transfer',
                args: [power_spawn.id, 'energy'],
                pos: power_spawn.pos
            })
        }
        if (power_spawn.store['power'] <= 50) {
            tasks.push({
                action: 'transfer',
                args: [power_spawn.id, 'power', power_spawn.store.getFreeCapacity('power')],
                pos: power_spawn.pos
            })
        }
        return tasks
    },
    T_nuker: function (room: Room): PosedCreepTask<"transfer">[] {
        if (!room.memory._typed._struct?.nuker) return []
        const nuker = Game.getObjectById(room.memory._typed._struct.nuker)
        if (!nuker) return []
        var tasks: PosedCreepTask<'transfer'>[] = []
        if (nuker.store.getFreeCapacity('energy')) {
            tasks.push({
                action: 'transfer',
                args: [nuker.id, 'energy'],
                pos: nuker.pos
            })
        }
        if (nuker.store.getFreeCapacity('G')) {
            tasks.push({
                action: 'transfer',
                args: [nuker.id, 'G', nuker.store.getFreeCapacity('G')],
                pos: nuker.pos
            })
        }
        return tasks
    },
    gen_safe: function (room: Room): PosedCreepTask<"generateSafeMode">[] {
        const controller = room.controller
        if (controller && controller.my && controller.level > 3 && controller.safeModeAvailable == 0) {
            return [{
                action: 'generateSafeMode',
                args: [controller.id],
                pos: controller.pos
            }]
        }

        else return []
    },
}