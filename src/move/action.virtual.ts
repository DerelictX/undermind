import {adjace_dir, base64table} from "@/move/Kuhn-Munkres"
import {hikeTo} from "@/move/route"

export const approach = function (creep: AnyCreep, pos: RoomPosition, range: number) {
    if (!creep.room) return ERR_NOT_FOUND
    const roomName = creep.room.name
    pos = new RoomPosition(pos.x, pos.y, pos.roomName)

    /**站着不动 */
    if (range <= 0 || creep instanceof Creep && creep.fatigue) {
        hold_place(creep)
        return OK
    }

    /**在范围内 */
    if (creep.pos.inRangeTo(pos, range)) {
        if (creep.pos.inRangeTo(pos, range - 1)) {
            return OK
        }
        /**在范围边缘 */
        let dir = creep.pos.getDirectionTo(pos)
        const _move_intents = global._move_intents[roomName] ?? (global._move_intents[roomName] = {})
        const pos_str = base64table[creep.pos.x] + base64table[creep.pos.y]
        _move_intents[pos_str] = {id: creep.id, step: adjace_dir[dir]}
        return OK
    }

    /**前进 */
    let ret = hikeTo(creep, pos)
    if (ret == ERR_TIRED)
        return OK
    return ret
}

export const hold_place = function (creep: AnyCreep): ScreepsReturnCode {
    /**设置intent */
    if (!creep.room) return ERR_NOT_FOUND
    const roomName = creep.room.name
    const _move_intents = global._move_intents[roomName] ?? (global._move_intents[roomName] = {})
    const pos_str = base64table[creep.pos.x] + base64table[creep.pos.y]
    _move_intents[pos_str] = {id: creep.id, step: [0]}
    return OK
}