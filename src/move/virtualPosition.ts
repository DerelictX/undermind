import _ from "lodash";
import {base64table} from "@/move/Kuhn-Munkres";
import {approach} from "@/move/action.virtual";

const crawlTo = function (squad: SquadMemory, targetPos: RoomPosition) {
    const roomName = targetPos.roomName

    /**房内寻路信息储存在_move */
    let _move = squad._move;
    /**缓存目标位置不正确 */
    if (!_move || _move.room != roomName
        || _move.dest.room != roomName
        || _move.dest.x != targetPos.x
        || _move.dest.y != targetPos.y) {
        if (seekToPos(squad, targetPos) == ERR_NO_PATH)
            return ERR_NO_PATH
        _move = squad._move;
    }
    if (!_move) return ERR_NO_PATH

    /**获取path */
    const path = Room.deserializePath(_move.path)
    const headPos = new RoomPosition(squad.head_pos.x, squad.head_pos.y, squad.head_pos.roomName)
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
        delete squad._move
        return ERR_TIRED;
    }
    /**设置intent */
    const _move_intents = global._move_intents[roomName] ?? (global._move_intents[roomName] = {})
    for (const creep_name in squad.member) {
        const creep = Game.creeps[creep_name]
        if (!creep) continue
        const i = (squad.offset_head - squad.member[creep_name]) & 3
        const off_xy = (squad.offset_pos << (2 * i)) & 3
        const x = headPos.x + (off_xy & 1)
        const y = headPos.y + ((off_xy & 2) >> 1)

        const pos_str = base64table[x] + base64table[y]
        _move_intents[pos_str] = {id: creep.id, step: [step.direction]}
    }
    return OK
}

/**房内寻路 */
const seekToPos = function (squad: SquadMemory, targetPos: RoomPosition) {
    const x = targetPos.x, y = targetPos.y, roomName = targetPos.roomName;
    delete squad._move;
    const room = Game.rooms[squad.head_pos.roomName]
    const path = room.findPath(squad.head_pos, targetPos, {
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
