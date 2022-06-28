import { reactions } from "@/structure/lab"

export const supply_updater: TaskUpdater<SupplyTaskPool> = {
    T_ext: function (room: Room): PosedCreepTask<"transfer">[] {
        var tasks: PosedCreepTask<'transfer'>[] = []
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
    T_tower: function (room: Room): PosedCreepTask<"transfer">[] {
        var tasks: PosedCreepTask<'transfer'>[] = []
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
    T_ctrl: function (room: Room): PosedCreepTask<"transfer">[] {
        var tasks: PosedCreepTask<'transfer'>[] = []
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
    T_src0: function (room: Room): PosedCreepTask<"transfer">[] {
        if(!room.memory._static.T_src0) return []
        return room.memory._static.T_src0
    },
    T_src1: function (room: Room): PosedCreepTask<"transfer">[] {
        if(!room.memory._static.T_src1) return []
        return room.memory._static.T_src1
    },
    T_src2: function (room: Room): PosedCreepTask<"transfer">[] {
        if(!room.memory._static.T_src2) return []
        return room.memory._static.T_src2
    },
    T_mnrl: function (room: Room): PosedCreepTask<"transfer">[] {
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