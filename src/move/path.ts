import _ from "lodash";

export const crawlTo = function(creep:Creep, targetPos:RoomPosition){
    var x=targetPos.x, y=targetPos.y, roomName=targetPos.roomName
    if(creep.room.name != roomName){
        creep.say('???')
        return ERR_INVALID_ARGS
    }
    const _move = creep.memory._move;
    if(_move?.room != roomName
            || _move.dest.room != roomName
            || _move.dest.x != x
            || _move.dest.y != y){
        if(seekTo(creep, targetPos) == ERR_NO_PATH)
            return ERR_NO_PATH
        if(!_move) return ERR_NO_PATH
    }
    
    const path = _.isString(_move.path) ? Room.deserializePath(_move.path) : _move.path;
    const idx = _.findIndex(path, {x: creep.pos.x, y: creep.pos.y});
    if(idx != -1) {
        path.splice(0,idx+1);
        try {_move.path = Room.serializePath(path);}
        catch(e) {console.log('$ERR',creep.pos,x,y,roomName,JSON.stringify(path)); throw e;}
    }
    if(path.length == 0) {
        return creep.pos.isNearTo(targetPos) ? OK : ERR_NO_PATH;
    }
    return creep.moveByPath(path);
}

const seekTo = function(creep:Creep, targetPos:RoomPosition){
    var x=targetPos.x, y=targetPos.y, roomName=targetPos.roomName
    delete creep.memory._move;
    const path = creep.room.findPath(creep.pos, targetPos, {
        ignoreCreeps:   true,
        costCallback:function(roomName: string, costMatrix: CostMatrix): void | CostMatrix {
            return
        }
    });
    if(path.length > 0) {
        creep.memory._move = {
            dest: {x,y,room:roomName},
            time: Game.time,
            path: Room.serializePath(path),
            room: creep.pos.roomName
        };
        return OK
    }
    return ERR_NO_PATH
}
