const asdf = function(fromRoom:string, toRoom:string){
    
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

const custom_move = {
    moveTo: function(creep:Creep,targetPos:RoomPosition){
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
    },
    
}