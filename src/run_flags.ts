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

const run_squad_square = function (flag: Flag, _squad: SquadMemory) {
    const roomName = _squad.head_pos.roomName
    const squad_length = _squad.member.length;

    /**判断是否就绪 */
    let ready = true
    for (let i = 0; i < squad_length; ++i) {
        const creep = Game.creeps[_squad.member[i]]
        if (!creep) continue
        const off_xy = (_squad.offset_pos << (2 * i)) & 3
        const x = _squad.head_pos.x + (off_xy & 1)
        const y = _squad.head_pos.y + ((off_xy & 2) >> 1)
        if (creep.fatigue || !creep.pos.isEqualTo(new RoomPosition(x, y, roomName))) {
            hikeTo(creep, new RoomPosition(x, y, roomName))
            ready = false
        }
    }
    if (!ready) return

    /**设置intent */
    if (!_squad.step) crawlSquad(_squad, flag.pos)
    const step = _squad.step
    if (!step) return;
    const _move_intents = global._move_intents[roomName] ?? (global._move_intents[roomName] = {})
    for (let i = 0; i < squad_length; ++i) {
        const creep = Game.creeps[_squad.member[i]]
        if (!creep) continue
        const pos_str = base64table[creep.pos.x] + base64table[creep.pos.x]
        _move_intents[pos_str] = {id: creep.id, step: [step.direction]}
    }
    _squad.head_pos.x += step.dx
    _squad.head_pos.y += step.dy
    delete _squad.step
}

const run_squad_line = function (flag: Flag, _squad: SquadMemory) {
    const roomName = _squad.head_pos.roomName
    const headPos = new RoomPosition(_squad.head_pos.x, _squad.head_pos.x, roomName)
    const squad_length = _squad.member.length;

    /**判断是否就绪 */
    let ready = true
    let prev_creep: RoomPosition | undefined = undefined
    for (let i = 0; i < squad_length; ++i) {
        const creep = Game.creeps[_squad.member[i]]
        if (!creep) continue
        if (!creep.pos.inRangeTo(headPos, i)) {
            hikeTo(creep, headPos)
            ready = false
        } else if (ready && prev_creep && !creep.pos.isNearTo(prev_creep)) {
            hikeTo(creep, prev_creep)
            ready = false
        }
        if (creep.fatigue) ready = false
        prev_creep = creep.pos
    }
    if (!ready) return

    /**设置intent */
    if (!_squad.step) crawlSquad(_squad, flag.pos)
    const step = _squad.step
    if (!step) return;
    prev_creep = undefined
    const _move_intents = global._move_intents[roomName] ?? (global._move_intents[roomName] = {})
    for (let i = 0; i < squad_length; ++i) {
        const creep = Game.creeps[_squad.member[i]]
        if (!creep) continue
        const pos_str = base64table[creep.pos.x] + base64table[creep.pos.x]
        if (!prev_creep) {
            _move_intents[pos_str] = {id: creep.id, step: [step.direction]}
        } else {
            _move_intents[pos_str] = {id: creep.id, step: [creep.pos.getDirectionTo(prev_creep)]}
        }
        prev_creep = creep.pos
    }
    _squad.head_pos.x += step.dx
    _squad.head_pos.y += step.dy
    delete _squad.step
}
