import _ from "lodash";
import {base64table} from "./Kuhn-Munkres";

export const crawlTo = function (creep: AnyCreep, targetPos: RoomPosition) {
    /**powerCreep未召唤 */
    if (!creep.room) return ERR_NOT_FOUND
    const roomName = targetPos.roomName
    /**房间不正确 */
    if (creep.room.name != roomName) {
        creep.say('???')
        return ERR_TIRED
    }

    /**房内寻路信息储存在_move */
    let _move = creep.memory._move;
    /**缓存目标位置不正确 */
    if (!_move || _move.room != roomName
        || _move.dest.room != roomName
        || _move.dest.x != targetPos.x
        || _move.dest.y != targetPos.y) {
        if (seekTo(creep, targetPos) == ERR_NO_PATH)
            return ERR_NO_PATH
        _move = creep.memory._move;
    }
    if (!_move) return ERR_NO_PATH

    /**获取path */
    const path = Room.deserializePath(_move.path)
    const pos = creep.pos
    const idx = _.findIndex(path, {x: pos.x, y: pos.y});
    if (idx != -1) {
        //从creep的位置截断path
        path.splice(0, idx + 1);
        _move.path = Room.serializePath(path)
    }
    if (path.length == 0) {
        return creep.pos.isNearTo(targetPos) ? OK : ERR_NO_PATH;
    }

    /**获取step */
    const step = _.find(path, (i) => i.x - i.dx == pos.x && i.y - i.dy == pos.y);
    if (!step) {
        //path无效
        delete creep.memory._move
        return ERR_TIRED;
    }
    /**设置intent */
    const _move_intents = global._move_intents[roomName] ?? (global._move_intents[roomName] = {})
    const pos_str = base64table[pos.x] + base64table[pos.y]
    _move_intents[pos_str] = {id: creep.id, step: [step.direction]}
    return OK
}

/**房内寻路 */
const seekTo = function (creep: AnyCreep, targetPos: RoomPosition) {
    if (!creep.room) return ERR_NOT_FOUND
    const x = targetPos.x, y = targetPos.y, roomName = targetPos.roomName;
    delete creep.memory._move;
    const path = creep.room.findPath(creep.pos, targetPos, {
        ignoreCreeps: true,
        maxRooms: 1
    });
    if (path.length > 0) {
        creep.memory._move = {
            dest: {x, y, room: roomName},
            time: Game.time,
            path: Room.serializePath(path),
            room: creep.pos.roomName
        };
        return OK
    }
    console.log(creep.pos + ' -> ' + targetPos + ' : ' + path.length)
    return ERR_NO_PATH
}