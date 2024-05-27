import _ from "lodash";
import {plainCallback, squadCallback} from "@/move/roomCallback";

export const crawlSquad = function (_squad: SquadMemory, targetPos: RoomPosition) {
    /**房内寻路信息储存在_move */
    let _move = _squad._move;
    /**缓存目标位置不正确 */
    if (!_move || _move.room != targetPos.roomName
        || _move.dest.room != targetPos.roomName
        || _move.dest.x != targetPos.x
        || _move.dest.y != targetPos.y) {
        if (seekToPos(_squad, targetPos) == ERR_NO_PATH)
            return ERR_NO_PATH
        _move = _squad._move;
    }
    if (!_move) return ERR_NO_PATH

    /**获取path */
    const path = Room.deserializePath(_move.path)
    const headPos = new RoomPosition(_squad.head_pos.x, _squad.head_pos.y, _squad.head_pos.roomName)
    const idx = _.findIndex(path, {x: headPos.x, y: headPos.y});
    if (idx != -1) {
        //从creep的位置截断path
        path.splice(0, idx + 1);
        _move.path = Room.serializePath(path)
    }
    if (path.length == 0) {
        return headPos.isNearTo(targetPos) ? OK : ERR_NO_PATH;
    }

    /**获取step */
    const step = _.find(path, (i) => i.x - i.dx == headPos.x && i.y - i.dy == headPos.y);
    if (!step) {
        //path无效
        delete _squad._move
        return ERR_TIRED;
    }
    _squad.step = step
    return OK
}

/**房内寻路 */
const seekToPos = function (squad: SquadMemory, targetPos: RoomPosition) {
    const x = targetPos.x, y = targetPos.y, roomName = targetPos.roomName;
    delete squad._move;
    const room = Game.rooms[squad.head_pos.roomName]
    const headPos = new RoomPosition(squad.head_pos.x, squad.head_pos.y, squad.head_pos.roomName)
    const path = room.findPath(headPos, targetPos, {
        costCallback: squad.formation == 'square' ? squadCallback : plainCallback,
        ignoreCreeps: true,
        maxRooms: 1
    });
    if (path.length > 0) {
        squad._move = {
            dest: {x, y, room: roomName},
            time: Game.time,
            path: Room.serializePath(path),
            room: squad.head_pos.roomName
        };
        return OK
    }
    console.log(squad.head_pos + ' -> ' + targetPos + ' : ' + path.length)
    return ERR_NO_PATH
}
