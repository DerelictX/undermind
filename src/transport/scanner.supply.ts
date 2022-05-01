
const supply_scanner: TaskUpdater<SupplyController> = {
    extension: function (tasks: CachedRoomTasks<'transfer'>, room: Room): void {
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
    },

    tower: function (tasks: CachedRoomTasks<'transfer'>, room: Room): void {
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
    },

    boost: function (tasks: CachedRoomTasks<'transfer'>, room: Room): void {
        for (let i in room.memory.structures.labs_out) {
            const boostType: MineralBoostConstant | undefined = room.memory.boost[i]
            const lab_out = Game.getObjectById(room.memory.structures.labs_out[i])
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
    },

    reactant: function (tasks: CachedRoomTasks<'transfer'>, room: Room): void {
        const reaction = room.memory.reaction
        if (!reaction) return

        for (let i in room.memory.structures.labs_in) {
            const reactantType = reaction[i]
            const lab_in = Game.getObjectById(room.memory.structures.labs_in[i])
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
    },

    pwr_spawn: function (tasks: CachedRoomTasks<'transfer'>, room: Room): void {
        if (!room.memory.structures.power_spawn) return
        const power_spawn = Game.getObjectById(room.memory.structures.power_spawn)
        if (!power_spawn) return

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
    },

    safe_mode: function (tasks: CachedRoomTasks<"generateSafeMode">, room: Room): void {
        const controller = room.controller
        if(controller && controller.my && controller.level > 2 && controller.safeModeAvailable == 0) {
            tasks.push({
                action: 'generateSafeMode',
                args:   [controller.id],
                pos:    controller.pos
            })
        }
    }
}