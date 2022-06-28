export const collect_updater: TaskUpdater<CollectTaskPool> = {
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
    deposit: function (room: Room): PosedCreepTask<"harvest">[] {
        var tasks: PosedCreepTask<"harvest">[] = []
        const deposits = room.find(FIND_SOURCES)
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

    H_srcs: function (room: Room): PosedCreepTask<"harvest">[] {
        if(!room.memory._static.H_srcs) return []
        return room.memory._static.H_srcs
    },
    H_src0: function (room: Room): PosedCreepTask<"harvest">[] {
        if(!room.memory._static.H_srcs || !room.memory._static.H_srcs[0]) return []
        return [room.memory._static.H_srcs[0]]
    },
    H_src1: function (room: Room): PosedCreepTask<"harvest">[] {
        if(!room.memory._static.H_srcs || !room.memory._static.H_srcs[1]) return []
        return [room.memory._static.H_srcs[1]]
    },
    H_src2: function (room: Room): PosedCreepTask<"harvest">[] {
        if(!room.memory._static.H_srcs || !room.memory._static.H_srcs[2]) return []
        return [room.memory._static.H_srcs[2]]
    },
    H_mnrl: function (room: Room): PosedCreepTask<"harvest">[] {
        if(!room.memory._static.H_mnrl) return []
        return room.memory._static.H_mnrl
    },
    
    W_srcs: function (room: Room): PosedCreepTask<"withdraw">[] {
        if(!room.memory._static.W_srcs) return []
        return room.memory._static.W_srcs
    },
    W_mnrl: function (room: Room): PosedCreepTask<"withdraw">[] {
        if(!room.memory._static.W_mnrl) return []
        return room.memory._static.W_mnrl
    },
    W_ctrl: function (room: Room): PosedCreepTask<"withdraw">[] {
        if(!room.memory._static.W_ctrl) return []
        return room.memory._static.W_ctrl
    }
}