import { reactions } from "@/structure/lab"

export const posed_task_updater: TaskUpdater<DynamicTaskPool> = {
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
        for (let i in hostile_stores) {
            const hostile_store = hostile_stores[i]
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

    compound: function (room: Room) {
        var tasks: PosedCreepTask<"withdraw">[] = []
        const labs = room.memory.structures.labs
        const compoundType = labs.reaction
        if (!compoundType)
            return []

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
    deposit: function (room: Room) {
        var tasks: Posed<RestrictedPrimitiveDescript<'harvest',DepositConstant>>[] = []
        const deposits = room.find(FIND_DEPOSITS)
        for (let deposit of deposits) {
            tasks.push({
                action: 'harvest',
                args: [deposit.id],
                pos: deposit.pos
            })
        }
        return tasks
    },
    recycle: function (room: Room): PosedCreepTask<"dismantle">[] {
        return []
    },

    H_srcs: function (room: Room) {
        if(!room.memory._static.H_srcs) return []
        return room.memory._static.H_srcs
    },
    H_src0: function (room: Room) {
        if(!room.memory._static.H_srcs || !room.memory._static.H_srcs[0]) return []
        return [room.memory._static.H_srcs[0]]
    },
    H_src1: function (room: Room) {
        if(!room.memory._static.H_srcs || !room.memory._static.H_srcs[1]) return []
        return [room.memory._static.H_srcs[1]]
    },
    H_src2: function (room: Room) {
        if(!room.memory._static.H_srcs || !room.memory._static.H_srcs[2]) return []
        return [room.memory._static.H_srcs[2]]
    },
    H_mnrl: function (room: Room) {
        if(!room.memory._static.H_mnrl) return []
        return room.memory._static.H_mnrl
    },
    
    W_srcs: function (room: Room) {
        if(!room.memory._static.W_srcs) return []
        return room.memory._static.W_srcs
    },
    W_mnrl: function (room: Room): PosedCreepTask<"withdraw">[] {
        if(!room.memory._static.W_mnrl) return []
        return room.memory._static.W_mnrl
    },
    W_ctrl: function (room: Room) {
        if(!room.memory._static.W_ctrl) return []
        return room.memory._static.W_ctrl
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
    T_ext: function (room: Room): Posed<RestrictedPrimitiveDescript<'transfer','energy'>>[] {
        var tasks: Posed<RestrictedPrimitiveDescript<'transfer','energy'>>[] = []
        if(room.energyAvailable == room.energyCapacityAvailable) return []
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
    T_tower: function (room: Room): Posed<RestrictedPrimitiveDescript<'transfer','energy'>>[] {
        var tasks: Posed<RestrictedPrimitiveDescript<'transfer','energy'>>[] = []
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
        return tasks
    },
    T_ctrl: function (room: Room):Posed<RestrictedPrimitiveDescript<'transfer','energy'>>[] {
        var tasks: Posed<RestrictedPrimitiveDescript<'transfer','energy'>>[] = []
        const containers = room.memory.structures.containers.outs
            .map(id => Game.getObjectById(id))
            .filter(s => s && s.store.getFreeCapacity('energy') >= 1200)
        for (let container of containers) {
            if (!container)
                continue
            tasks.push({
                action: 'transfer',
                args: [container.id, 'energy'],
                pos: container.pos
            })
        }
        return tasks
    },
    T_src0: function (room: Room) {
        if(!room.memory._static.T_src0) return []
        return room.memory._static.T_src0
    },
    T_src1: function (room: Room) {
        if(!room.memory._static.T_src1) return []
        return room.memory._static.T_src1
    },
    T_src2: function (room: Room) {
        if(!room.memory._static.T_src2) return []
        return room.memory._static.T_src2
    },
    T_mnrl: function (room: Room) {
        if(!room.memory._static.T_mnrl) return []
        return room.memory._static.T_mnrl
    },
    T_boost: function (room: Room): PosedCreepTask<"transfer">[] {
        const labs = room.memory.structures.labs
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
        const labs = room.memory.structures.labs
        const compoundType = labs.reaction
        if (!compoundType)
            return []
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
        if (!room.memory.structures.power_spawn)
            return []
        const power_spawn = Game.getObjectById(room.memory.structures.power_spawn)
        if (!power_spawn)
            return []
        var tasks: PosedCreepTask<'transfer'>[] = []
        if (power_spawn.store['energy'] <= 3000) {
            tasks.push({
                action: 'transfer',
                args: [power_spawn.id, 'energy', power_spawn.store.getFreeCapacity('energy')],
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
    gen_safe: function (room: Room): PosedCreepTask<"generateSafeMode">[] {
        const controller = room.controller
        if (controller && controller.my && controller.level > 2 && controller.safeModeAvailable == 0) {
            return [{
                action: 'generateSafeMode',
                args: [controller.id],
                pos: controller.pos
            }]
        } else return []
    }
}