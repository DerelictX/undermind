import {loop_flags} from "@/controller/loopFlags";
import {hikeTo} from "@/move/route";
import _ from "lodash";

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

export const init_loop_flag = function (name: string, key: AnyLoopType) {
    Memory.flags[name] = {
        _class: '_loop', _loop: {
            _loop_type: key, _time: 0, interval: 1500
        }
    }
}
_.assign(global, {init_loop_flag: init_loop_flag})

export const init_room_flag = function (room: Room) {
    if (!room.controller?.my) return
    const sources = room.find(FIND_SOURCES)
    for (let i in sources) {
        const source = sources[i]
        const flag_name = room.name + '_source' + i
        if (!Game.flags[flag_name]) {
            init_loop_flag(flag_name, '_source')
            room.createFlag(source.pos, flag_name)
        }
    }
    const roles: AnyLoopType[] = ['_supply', '_collect', '_maintain', '_upgrade', '_chemist', '_fortify']
    for (const role of roles) {
        const flag_name = room.name + role
        if (!Game.flags[flag_name]) {
            init_loop_flag(flag_name, role)
            room.createFlag(room.controller.pos, flag_name)
        }
    }
}
_.assign(global, {init_room_flag: init_room_flag})

const run_squad = function (flag: Flag) {
    //const offset = (0 << 0) | (1 << 2) | (3 << 4) | (2 << 6)
    const _squad = flag.memory._squad
    if (!_squad) return;
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
            hikeTo(creep, new RoomPosition(x, y, roomName))
        }
    }
    if (!ready) return

    //todo: _squad.head_pos 移动一步
}
