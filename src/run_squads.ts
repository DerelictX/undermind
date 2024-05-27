import {hikeTo} from "@/move/single_creep/route";
import {hikeSquad} from "@/move/squad/route";
import {base64table} from "@/move/Kuhn-Munkres";

export const run_squads = function () {
    for (let name in Memory.squads) {
        try {
            const _squad = Memory.squads[name]
            if (!_squad) continue
            if (_squad.pending) {
                if (_squad.size == _squad.member.length)
                    delete _squad.pending
                else continue
            } else if (_squad.size <= 0) {
                delete Memory.squads[name]
                continue
            }
            switch (_squad.formation) {
                case 'square':
                    run_squad_square(_squad)
                    break;
                case 'snake':
                    run_squad_snake(_squad)
                    break;
            }
        } catch (error) {
            console.log(name + ':\t' + error);
        }
    }
}

const run_squad_square = function (_squad: SquadMemory) {
    //_squad.target_pos = Game.flags['attack_squad_test']?.pos
    const exitRoom = Game.map.describeExits(_squad.head_pos.roomName)
    if (_squad.head_pos.x == 0 && exitRoom[LEFT]) {
        _squad.head_pos.x = 48
        _squad.head_pos.roomName = exitRoom[LEFT]
    }
    if (_squad.head_pos.x == 49 && exitRoom[RIGHT]) {
        _squad.head_pos.x = 1
        _squad.head_pos.roomName = exitRoom[RIGHT]
    }
    if (_squad.head_pos.y == 0 && exitRoom[TOP]) {
        _squad.head_pos.y = 48
        _squad.head_pos.roomName = exitRoom[TOP]
    }
    if (_squad.head_pos.y == 49 && exitRoom[BOTTOM]) {
        _squad.head_pos.y = 1
        _squad.head_pos.roomName = exitRoom[BOTTOM]
    }
    const roomName = _squad.head_pos.roomName
    const squad_length = _squad.member.length;

    /**判断是否就绪 */
    let ready = true
    let survive = 0;
    for (let i = 0; i < squad_length; ++i) {
        const creep = Game.creeps[_squad.member[i]]
        if (!creep) continue
        survive++
        const off_xy = (_squad.offset_pos >> (2 * i)) & 3
        let x = _squad.head_pos.x + (off_xy & 1)
        let y = _squad.head_pos.y + ((off_xy & 2) >> 1)
        let _roomName = roomName
        if (x == 50 && exitRoom[RIGHT]) {
            x = 1
            _roomName = exitRoom[RIGHT]
        }
        if (y == 50 && exitRoom[BOTTOM]) {
            y = 1
            _roomName = exitRoom[BOTTOM]
        }
        const pos = new RoomPosition(x, y, _roomName)
        if (creep.fatigue || !creep.pos.isEqualTo(pos)) {
            hikeTo(creep, pos)
            ready = false
        }
    }
    if (!ready) return
    if (!survive) {
        _squad.size = -1
        return
    }

    /**设置intent */
    if (!_squad.step) hikeSquad(_squad)
    const step = _squad.step
    if (!step) return;
    const _move_intents = global._move_intents[roomName] ?? (global._move_intents[roomName] = {})
    for (let i = 0; i < squad_length; ++i) {
        const creep = Game.creeps[_squad.member[i]]
        if (!creep) continue
        const pos_str = base64table[creep.pos.x] + base64table[creep.pos.y]
        _move_intents[pos_str] = {id: creep.id, step: [step.direction]}
    }
    _squad.head_pos.x += step.dx
    _squad.head_pos.y += step.dy
    if (step.direction == TOP) {
        _squad.offset_pos = 141 //(1 << 0) + (3 << 2) + (0 << 4) + (2 << 6)
    } else if (step.direction == RIGHT) {
        _squad.offset_pos = 27 //(3 << 0) + (2 << 2) + (1 << 4) + (0 << 6)
    } else if (step.direction == BOTTOM) {
        _squad.offset_pos = 114 //(2 << 0) + (0 << 2) + (3 << 4) + (1 << 6)
    } else if (step.direction == LEFT) {
        _squad.offset_pos = 228 //(0 << 0) + (1 << 2) + (2 << 4) + (3 << 6)
    }
    delete _squad.step
}

const run_squad_snake = function (_squad: SquadMemory) {
    //_squad.target_pos = Game.flags['attack_squad_test']?.pos
    const exitRoom = Game.map.describeExits(_squad.head_pos.roomName)
    if (_squad.head_pos.x == 0 && exitRoom[LEFT]) {
        _squad.head_pos.x = 48
        _squad.head_pos.roomName = exitRoom[LEFT]
    }
    if (_squad.head_pos.x == 49 && exitRoom[RIGHT]) {
        _squad.head_pos.x = 1
        _squad.head_pos.roomName = exitRoom[RIGHT]
    }
    if (_squad.head_pos.y == 0 && exitRoom[TOP]) {
          _squad.head_pos.y = 48
        _squad.head_pos.roomName = exitRoom[TOP]
    }
    if (_squad.head_pos.y == 49 && exitRoom[BOTTOM]) {
        _squad.head_pos.y = 1
        _squad.head_pos.roomName = exitRoom[BOTTOM]
    }

    const roomName = _squad.head_pos.roomName
    const headPos = new RoomPosition(_squad.head_pos.x, _squad.head_pos.y, roomName)
    const squad_length = _squad.member.length;

    /**判断是否就绪 */
    let ready = true
    let survive = 0;
    let on_edge = 0
    let prev_creep: RoomPosition | undefined = undefined
    for (let i = 0; i < squad_length; ++i) {
        const creep = Game.creeps[_squad.member[i]]
        if (!creep) continue
        survive++
        if (!creep.pos.inRangeTo(headPos, i)) {
            hikeTo(creep, headPos)
            if (creep.pos.roomName == headPos.roomName)
                ready = false
        } else if (ready && prev_creep && !creep.pos.isNearTo(prev_creep)) {
            hikeTo(creep, prev_creep)
            if (creep.pos.roomName == prev_creep.roomName)
                ready = false
        }
        if (creep.fatigue) ready = false
        prev_creep = creep.pos
    }
    if (!ready) return
    if (!survive) {
        _squad.size = -1
        return
    }

    /**设置intent */
    if (!_squad.step) hikeSquad(_squad)
    const step = _squad.step
    if (!step) return;
    prev_creep = undefined
    const _move_intents = global._move_intents[roomName] ?? (global._move_intents[roomName] = {})
    for (let i = 0; i < squad_length; ++i) {
        const creep = Game.creeps[_squad.member[i]]
        if (!creep) continue
        const pos_str = base64table[creep.pos.x] + base64table[creep.pos.y]
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
