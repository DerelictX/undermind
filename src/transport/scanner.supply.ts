import { reactions } from "@/structure/lab"

const supply_updater: TaskUpdater<SupplyController> = {

    boost: function (tasks: CachedRoomTasks<'transfer'>, room: Room): void {
        const labs = room.memory.structures.labs

        for (let i in labs.outs) {
            const boostType: MineralBoostConstant | undefined = labs.boosts[i]
            const lab_out = Game.getObjectById(labs.outs[i])
            if (!lab_out) continue

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
        const labs = room.memory.structures.labs
        const compoundType = labs.reaction
        if (!compoundType) return

        for (let i in labs.ins) {
            const reactantType = reactions[compoundType][i]
            const lab_in = Game.getObjectById(labs.ins[i])
            if (!lab_in) continue

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