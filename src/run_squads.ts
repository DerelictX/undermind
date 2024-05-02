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
    if (!_squad.step) hikeSquad(_squad)
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

const run_squad_snake = function (_squad: SquadMemory) {
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
    if (!_squad.step) hikeSquad(_squad)
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
