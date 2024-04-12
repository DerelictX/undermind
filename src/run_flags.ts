import {loop_flags} from "@/controller/loopFlags";
import {approach} from "@/move/action.virtual";

export const run_flags = function () {
    for (let name in Memory.flags) {
        try {
            const flag = Game.flags[name]
            if (!flag) continue
            if (flag.memory._class == '_loop') {
                loop_flags(flag)
            }
            if (flag.memory._class == '_squad') {
                run_squad(flag)
            }
        } catch (error) {
            console.log(name + ':\t' + error);
        }
    }
}

const run_squad = function (flag: Flag) {
    //const offset = (0 << 0) | (1 << 2) | (3 << 4) | (2 << 6)
    const _squad = flag.memory._squad
    let ready = true
    for (const creep_name in _squad.member) {
        const creep = Game.creeps[creep_name]
        if (!creep) continue
        const i = (_squad.offset_head - _squad.member[creep_name]) & 3
        const off_xy = (_squad.offset_pos << (2 * i)) & 3
        const x = _squad.head_pos.x + (off_xy & 1)
        const y = _squad.head_pos.y + ((off_xy & 2) >> 1)
        const roomName = _squad.head_pos.roomName
        if (creep.fatigue || !creep.pos.isEqualTo(new RoomPosition(x, y, roomName))) {
            //not ready to move
            ready = false
            approach(creep, new RoomPosition(x, y, roomName), 0)
        }
    }
    if (!ready) return

    //todo: _squad.head_pos 移动一步
    for (const creep_name in _squad.member) {
        const creep = Game.creeps[creep_name]
        if (!creep) continue
        const i = (_squad.offset_head - _squad.member[creep_name]) & 3
        const off_xy = (_squad.offset_pos << (2 * i)) & 3
        const x = _squad.head_pos.x + (off_xy & 1)
        const y = _squad.head_pos.y + ((off_xy & 2) >> 1)
        const roomName = _squad.head_pos.roomName
        approach(creep, new RoomPosition(x, y, roomName), 0)
    }
}
