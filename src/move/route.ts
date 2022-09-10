import { crawlTo, real_roomPos } from "./path"

export const hikeTo = function(creep:Creep|PowerCreep, targetPos:RoomPosition){
    if(!creep.room) return ERR_NOT_FOUND
    if(creep.room.name == targetPos.roomName)
        return crawlTo(creep,targetPos)
    const _hike = creep.memory._hike
    if(!_hike || _hike.to != targetPos.roomName) {
        if(seekTo(creep, targetPos.roomName) == ERR_NO_PATH)
            return ERR_NO_PATH
        if(!_hike || !_hike.route[0]) return ERR_NO_PATH
    }

    if(creep.room.name == _hike.from){
        if(creep.memory._move){
            const exit = real_roomPos(creep.memory._move.dest)
            const a = (_hike.route[0].exit == TOP || _hike.route[0].exit == BOTTOM) ? exit.y : exit.x
            const b = (_hike.route[0].exit == TOP || _hike.route[0].exit == LEFT) ? 0 : 50
            if(a != b) {
                delete creep.memory._move
                return ERR_TIRED
            }
            const ret = crawlTo(creep,exit)
            if(ret == ERR_INVALID_ARGS) {
                delete creep.memory._move
                return ERR_TIRED
            }
            return ret
        }
        const exit = creep.pos.findClosestByRange(_hike.route[0].exit);
        return exit ? crawlTo(creep,exit) : ERR_NO_PATH
    }
    if(creep.room.name == _hike.route[0].room){
        _hike.from = _hike.route[0].room
        _hike.route.shift()
        const exit = creep.pos.findClosestByRange(_hike.route[0].exit);
        return exit ? crawlTo(creep,exit) : ERR_NO_PATH
    }
    creep.say('...')
    return ERR_TIRED
}

const seekTo = function(creep:Creep|PowerCreep, toRoom:string){
    if(!creep.room) return ERR_NOT_FOUND
    delete creep.memory._hike;
    const route = Game.map.findRoute(creep.room, toRoom, {routeCallback:routeCallback});
    if(route != ERR_NO_PATH && route.length > 0) {
        creep.memory._hike = {
            from:   creep.room.name,
            to:     toRoom,
            route:  route
        }
        return OK
    }
    return ERR_NO_PATH
}

const routeCallback = function(roomName:string):number {
    let isHighway = roomName.indexOf('0') != -1
    const room:Room|undefined = Game.rooms[roomName]
    let isMyRoom = room && room.controller && room.controller.my
    if (isHighway || isMyRoom) {
        return 1;
    } else {
        return 2.5;
    }
}
