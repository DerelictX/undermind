import { crawlTo } from "./path"

const hikeTo = function(creep:Creep, targetPos:RoomPosition){
    if(creep.room.name == targetPos.roomName)
        return crawlTo(creep,targetPos)
    const _hike = creep.memory._hike
    if(!_hike || _hike.to != targetPos.roomName) {
        if(seekTo(creep, targetPos.roomName) == ERR_NO_PATH)
            return ERR_NO_PATH
        if(!_hike || !_hike.route[0]) return ERR_NO_PATH
    }

    if(creep.fatigue) return ERR_TIRED
    if(creep.room.name == _hike.from){
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

const seekTo = function(creep:Creep, toRoom:string){
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
