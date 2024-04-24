import {loop_flags} from "@/controller/loopFlags";
import {hikeTo} from "@/move/route";
import _ from "lodash";
import {crawlSquad} from "@/move/virtualPosition";
import {base64table} from "@/move/Kuhn-Munkres";

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
    const roles: AnyLoopType[] = [
        '_supply', '_collect', '_chemist',
        '_maintain', '_upgrade', '_fortify',
        '_observe'
    ]
    for (const role of roles) {
        const flag_name = room.name + role
        if (!Game.flags[flag_name]) {
            room.createFlag(room.controller.pos, flag_name)
        }
        if (!Memory.flags[flag_name]) {
            init_loop_flag(flag_name, role)
        }
    }
}
_.assign(global, {init_room_flag: init_room_flag})

const run_squad = function (flag: Flag) {
    //const offset = (0 << 0) | (1 << 2) | (3 << 4) | (2 << 6)
    const _squad = flag.memory._squad
    if (!_squad) return;
    if (!_squad.step) crawlSquad(_squad, flag.pos)
    const step = _squad.step
    if (!step) return;

    const roomName = _squad.head_pos.roomName
    let ready = true
    const squad_length = _squad.member.length;
    for (let i = 0; i < squad_length; ++i) {
        const creep = Game.creeps[_squad.member[i]]
        if (!creep) continue
        const off_xy = (_squad.offset_pos << (2 * i)) & 3
        const x = _squad.head_pos.x + (off_xy & 1)
        const y = _squad.head_pos.y + ((off_xy & 2) >> 1)
        if (creep.fatigue || !creep.pos.isEqualTo(new RoomPosition(x, y, roomName))) {
            //not ready to move
            ready = false
            hikeTo(creep, new RoomPosition(x, y, roomName))
        }
    }
    if (!ready) return

    /**设置intent */
    const _move_intents = global._move_intents[roomName] ?? (global._move_intents[roomName] = {})
    for (let i = 0; i < squad_length; ++i) {
        const creep = Game.creeps[_squad.member[i]]
        if (!creep) continue
        const off_xy = (_squad.offset_pos << (2 * i)) & 3
        const x = _squad.head_pos.x + (off_xy & 1)
        const y = _squad.head_pos.y + ((off_xy & 2) >> 1)

        const pos_str = base64table[x] + base64table[y]
        _move_intents[pos_str] = {id: creep.id, step: [step.direction]}
    }
    _squad.head_pos.x += step.dx
    _squad.head_pos.y += step.dy
    delete _squad.step
}
