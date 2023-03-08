import { compound } from "@/structure/lv6_lab"
import { W_term } from "@/structure/lv6_terminal"
import { W_fact } from "@/structure/lv7_factory"

export const update_col_cache = function
    <T extends keyof CollectTaskCache>
    (pool: Partial<CollectTaskCache>, key: T, room: Room)
    {pool[key] = collect_cache_updater[key](room)}

const collect_cache_updater: {
    [P in keyof CollectTaskCache]: (room:Room) => CollectTaskCache[P]
} = {
    /**
     * 从container取所有类型资源
     * @param room
     * @returns
     */
    W_cntn: function (room: Room) {
        const W_cntn = Memory.W_cntn[room.name]
        if (!W_cntn) return []
        var tasks: RestrictedPrimitiveDescript<'withdraw',ResourceConstant>[] = []
        for (let id of W_cntn) {
            const container = Game.getObjectById(id)
            if (!container || container.store.getFreeCapacity('energy') > 800)
                continue
            var store: StorePropertiesOnly = container.store
            var resourceType: keyof typeof store
            for (resourceType in store) {
                tasks.push({ action: 'withdraw', args: [container.id, resourceType], pos: container.pos })
            }
        }
        return tasks
    },
    W_link: function (room: Room) {
        const nexus = room.memory.links?.nexus
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
                if(resourceType == 'ops' ||
                    resourceType != 'G' && resourceType.length == 1)
                    continue
                tasks.push({
                    action: 'withdraw',
                    args: [ruin.id, resourceType],
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
        const H_srcs = Memory.H_srcs[room.name]
        if (!H_srcs) return []
        var tasks: RestrictedPrimitiveDescript<'harvest', 'energy'>[] = []
        for (let id of H_srcs) {
            const source = Game.getObjectById(id)
            if(source?.energy)
                tasks.push({ action: 'harvest' , args: [id], pos: source.pos })
        }
        return tasks
    },
    W_energy: function (room: Room) {
        var tasks: RestrictedPrimitiveDescript<'withdraw' | 'pickup', 'energy'>[] = []
        const storage = room.storage ?? room.terminal
        if (storage && storage.store['energy'] >= 10000) {
            tasks.push({
                action: 'withdraw',
                args: [storage.id, 'energy'],
                pos: storage.pos
            })
        }
        if (tasks.length)
            return tasks

        const W_cntn = Memory.W_cntn[room.name]
        if (W_cntn) {
            for (let id of W_cntn) {
                const container = Game.getObjectById(id)
                if (container && container.store['energy'] >= 800) {
                    tasks.push({
                        action: 'withdraw',
                        args: [container.id, 'energy'],
                        pos: container.pos
                    })
                }
            }
        }
        if (room.memory.links) {
            const links = room.memory.links.outs
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

    compound: compound,
    W_term: W_term,
    W_fact: W_fact
}