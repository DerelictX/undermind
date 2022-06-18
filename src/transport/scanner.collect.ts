const collect_updater: TaskUpdater<CollectController> = {

    harvested: function (tasks: CachedRoomTasks<"withdraw">, room: Room): void {
        const containers = room.memory.structures.containers.ins
            .map(id => Game.getObjectById(id))
            .filter(s => s && s.store.getUsedCapacity() >= 1200)
        for (let container of containers) {
            if (!container)
                continue
            var store: StorePropertiesOnly = container.store
            var resourceType: keyof typeof store
            for (resourceType in store) {
                tasks.push({
                    action: 'withdraw',
                    args: [container.id, resourceType, container.store[resourceType]],
                    pos: container.pos
                })
            }
        }
    },

    loot: function (tasks: CachedRoomTasks<"withdraw">, room: Room): void {
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

    },

    sweep: function (tasks: CachedRoomTasks<"withdraw">, room: Room): void {
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
    },

    compound: function (tasks: CachedRoomTasks<"withdraw">, room: Room): void {
        const labs = room.memory.structures.labs
        const compoundType = labs.reaction
        if (!compoundType) return

        for (let i in labs.outs) {
            const boostType: MineralBoostConstant | undefined = labs.boosts[i]
            const lab_out = Game.getObjectById(labs.outs[i])
            if (!lab_out) continue

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
    },
    source: function (tasks: CachedRoomTasks<"harvest">, room: Room): void {
        throw new Error("Function not implemented.")
    },
    mineral: function (tasks: CachedRoomTasks<"harvest">, room: Room): void {
        throw new Error("Function not implemented.")
    },
    deposit: function (tasks: CachedRoomTasks<"harvest">, room: Room): void {
        throw new Error("Function not implemented.")
    },
    recycle: function (tasks: CachedRoomTasks<"dismantle">, room: Room): void {
        throw new Error("Function not implemented.")
    }
}