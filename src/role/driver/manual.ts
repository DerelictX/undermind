import {approach} from "@/move/action.virtual";
import {init_worker_behavior} from "@/role/initializer/config.behavior";

export const run_manual = function (creep: Creep, fb: ManualMemory) {
    if (Game.shard.name == 'shard3') {
        approach(creep, new RoomPosition(19, 23, 'E40S50'), 0)
        return
    }
    const pos = new RoomPosition(16, 26, 'E38S49')
    if (creep.room.name != 'E38S49') {
        approach(creep, pos, 0)
        return;
    }
    creep.memory._class = init_worker_behavior('Builder', 'E38S49', 'E38S49')
}