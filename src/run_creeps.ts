import {run_carrier} from "./role/driver/carrier";
import {run_worker} from "./role/driver/worker";
import {run_static} from "./role/driver/static";
import {operator_run} from "./power_creep/operator";
import {run_for_boost} from "./structure/lv6_lab";

export const run_creeps = function () {
    for (let name in Memory.creeps) {
        try {
            const creep = Game.creeps[name]
            if (!creep) {
                delete Memory.creeps[name];
                continue
            }
            if (creep.spawning) continue
            if (Game.cpu.bucket < 6000 && Game.cpu.getUsed() > 10) return
            if (Game.cpu.bucket < 8000 && Game.cpu.getUsed() > 15) return

            if (creep.memory._life.boost) {
                run_for_boost(creep)
                continue
            }

            const _class = creep.memory._class
            switch (_class.bhvr_name) {
                case 'carrier':
                    run_carrier(creep, _class)
                    break
                case 'worker':
                    run_worker(creep, _class)
                    break
                case 'static':
                    run_static(creep, _class)
                    break
                default:
                    throw new Error("Unexpected state.")
            }
        } catch (error) {
            console.log(name + ':\t' + error);
        }
    }
}

export const run_power_creeps = function () {
    for (let name in Game.powerCreeps) {
        try {
            const powerCreep = Game.powerCreeps[name]
            if (!powerCreep.shard)
                continue
            if (!powerCreep.memory._tasks)
                powerCreep.memory = {_power: [], _tasks: []}
            switch (powerCreep.className) {
                case 'operator':
                    operator_run(powerCreep);
                    break;
            }
        } catch (error) {
            console.log(name + ':\t' + error);
        }
    }
}