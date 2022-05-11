import _ from "lodash";

const hikeTo = function(creep:Creep, targetPos:RoomPosition){
    if(creep.room.name == targetPos.roomName)
        return crawlTo(creep,targetPos)
    const _hike = creep.memory._hike
    if(!_hike || _hike.to != targetPos.roomName){
        if(seekTo(creep, targetPos.roomName) == ERR_NO_PATH)
            return ERR_NO_PATH
    }
    if(!_hike || !_hike.route[0]) return ERR_NO_PATH
    if(creep.room.name == _hike.from){
        const exit = creep.pos.findClosestByRange(_hike.route[0].exit);
        return exit ? crawlTo(creep,exit) : ERR_NO_PATH
    }
    if(creep.fatigue == 0 && creep.room.name == _hike.route[0].room){
        _hike.from = _hike.route[0].room
        _hike.route.shift()
        const exit = creep.pos.findClosestByRange(_hike.route[0].exit);
        return exit ? crawlTo(creep,exit) : ERR_NO_PATH
    }
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

const crawlTo = function(creep:Creep,targetPos:RoomPosition){
    var x=targetPos.x, y=targetPos.y, roomName=targetPos.roomName

    if(creep.memory._move) {

        var _move = creep.memory._move;

        if(Game.time > _move.time + 10 || _move.room != creep.pos.roomName) {
            delete creep.memory._move;
        }
        else if(_move.dest.room == roomName && _move.dest.x == x && _move.dest.y == y) {

            var path = _.isString(_move.path) ? Room.deserializePath(_move.path) : _move.path;

            var idx = _.findIndex(path, {x: creep.pos.x, y: creep.pos.y});
            if(idx != -1) {
                var oldMove = _.cloneDeep(_move);
                path.splice(0,idx+1);
                try {
                    _move.path = Room.serializePath(path);
                }
                catch(e) {
                    console.log('$ERR',creep.pos,x,y,roomName,JSON.stringify(path),'-----',JSON.stringify(oldMove));
                    throw e;
                }
            }
            if(path.length == 0) {
                return creep.pos.isNearTo(targetPos) ? OK : ERR_NO_PATH;
            }

            var result = creep.moveByPath(path);
            if(result == OK) {
                return OK;
            }
        }
    }

    var path = creep.pos.findPathTo(targetPos);
    creep.memory._move = {
        dest: {x,y,room:roomName},
        time: Game.time,
        path: Room.serializePath(path),
        room: creep.pos.roomName
    };

    if(path.length == 0) {
        return ERR_NO_PATH;
    }

    return creep.move(path[0].direction);
}