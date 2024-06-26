import _ from "lodash"
import {crawlTo} from "@/move/single_creep/path";
import {routeCallback, update_exit} from "@/move/routeCallback";

export const hikeTo = function (creep: AnyCreep, targetPos: RoomPosition) {
    /**powerCreep未召唤 */
    if (!creep.room) return ERR_NOT_FOUND
    /**同房间直接走 */
    if (creep.room.name == targetPos.roomName) {
        return crawlTo(creep, targetPos)
    }

    /**房际寻路信息储存在_hike */
    let _hike = creep.memory._hike
    /**缓存目标房间不正确 */
    if (_hike?.to != targetPos.roomName) {
        if (seekToRoom(creep, targetPos.roomName) == ERR_NO_PATH)
            return ERR_NO_PATH
        _hike = creep.memory._hike
    }
    if (!_hike?.route[0]) return ERR_NO_PATH

    /**离开上一个房间，出队 */
    if (creep.room.name == _hike.route[0].room) {
        _hike.from = _hike.route[0].room
        _hike.route.shift()
    }
    /**当前房间不正确，可能是被exit或portal传回上个房间了 */
    if (creep.room.name != _hike.from) {
        console.log(creep.pos + '.roomName != ' + _hike.from)
        return ERR_TIRED
    }

    /**进入下一个房间的入口 */
    const step = _hike.route[0]
    let exit = step.exitPos
    if (exit) {
        exit = new RoomPosition(exit.x, exit.y, exit.roomName)
        return crawlTo(creep, exit)
    }

    //分段寻路优化，在当前房间和下一个房间寻路，用来优化通往下个房间的exit
    const exits: RoomPosition[] = []
    if (_hike.route[1]) {
        //从内存获取下个房间通往下下个房间的exits
        const exit_cache = Memory._edge_exits[step.room]?.[_hike.route[1].room]
        if (!exit_cache) {
            exits.push(new RoomPosition(25, 25, step.room))
        } else for (const pos of exit_cache) {
            exits.push(new RoomPosition(pos.x, pos.y, pos.roomName))
        }
    } else {
        //终点在下个房间
        exits.push(targetPos)
    }
    const path = PathFinder.search(creep.pos, exits, {
        plainCost: 2, swampCost: 10, maxRooms: 2,
        roomCallback: function (roomName: string): CostMatrix | boolean {
            if (roomName != _hike?.from && roomName != step.room) return false
            const matrix = global.commonMatrix[roomName]
            if (matrix) return PathFinder.CostMatrix.deserialize(matrix)
            return true
        }
    })
    //在房间交界处截断，获取exit
    exit = _.findLast(path.path, (pos) => pos.roomName == _hike?.from)

    if (exit) {
        // const a = (step.exit == TOP || step.exit == BOTTOM) ? exit.y : exit.x
        // const b = (step.exit == TOP || step.exit == LEFT) ? 0 : 49
        if (/*a != b && */exit.roomName != creep.room.name) {
            creep.say('false exit')
            console.log('false exit: ' + exit)
            delete step.exitPos
            return ERR_NO_PATH
        } else {
            step.exitPos = exit
            return crawlTo(creep, exit)
        }
    }
    return ERR_TIRED
}

/**房际寻路 */
const seekToRoom = function (creep: AnyCreep, toRoom: string) {
    if (!creep.room) return ERR_NOT_FOUND
    delete creep.memory._hike;
    const route = Game.map.findRoute(creep.room, toRoom, {routeCallback: routeCallback});
    if (route == ERR_NO_PATH || route.length <= 0) {
        return ERR_NO_PATH
    }
    creep.memory._hike = {
        from: creep.room.name,
        to: toRoom,
        route: route
    }
    update_exit(creep.room.name)
    for (let step of route) {
        update_exit(step.room)
    }
    return OK
}
