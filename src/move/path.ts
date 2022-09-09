import _ from "lodash";

export const crawlTo = function(creep:Creep|PowerCreep, targetPos:RoomPosition){
    if(!creep.room) return ERR_NOT_FOUND
    let pos_str = ''
    pos_str += creep.pos.x > 9 ? creep.pos.x : '0' + creep.pos.x
    pos_str += creep.pos.y > 9 ? creep.pos.y : '0' + creep.pos.y
    delete creep.room.memory._pos_hold?.[pos_str]

    var x=targetPos.x, y=targetPos.y, roomName=targetPos.roomName
    if(creep.room.name != roomName){
        creep.say('???')
        return ERR_INVALID_ARGS
    }
    let _move = creep.memory._move;
    if(!_move || _move.room != roomName
            || _move.dest.room != roomName
            || _move.dest.x != x
            || _move.dest.y != y){
        if(seekTo(creep, targetPos) == ERR_NO_PATH)
            return ERR_NO_PATH
    }
    _move = creep.memory._move;
    if(!_move) return ERR_NO_PATH

    const path = Room.deserializePath(_move.path)
    const idx = _.findIndex(path, {x: creep.pos.x, y: creep.pos.y});
    if(idx != -1) {
        path.splice(0,idx+1);
        try {_move.path = Room.serializePath(path);}
        catch(e) {console.log('$ERR',creep.pos,x,y,roomName,JSON.stringify(path)); throw e;}
    }
    if(path.length == 0) {
        return creep.pos.isNearTo(targetPos) ? OK : ERR_NO_PATH;
    }
    return moveByPath(creep,path)
}

const seekTo = function(creep:Creep|PowerCreep, targetPos:RoomPosition){
    if(!creep.room) return ERR_NOT_FOUND
    var x=targetPos.x, y=targetPos.y, roomName=targetPos.roomName
    delete creep.memory._move;
    const path = creep.room.findPath(creep.pos, targetPos, {
        ignoreCreeps:   true
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

const moveByPath = function(creep:Creep|PowerCreep, path: PathStep[]) {
    if(!creep.room) return ERR_NOT_FOUND
    const pos = creep.pos
    let cur = _.find(path, (i) => i.x - i.dx == pos.x && i.y - i.dy == pos.y);
    if(!cur) {
        delete creep.memory._move
        return ERR_TIRED;
    }
    let pos_str = ''
    pos_str += cur.x > 9 ? cur.x : '0' + cur.x
    pos_str += cur.y > 9 ? cur.y : '0' + cur.y

    const block_id = creep.room.memory._pos_hold?.[pos_str]
    if(block_id){
        const block_creep = Game.getObjectById(block_id)
        if(block_creep?.pos.roomName == pos.roomName){
            if(block_creep.pos.x == cur.x && block_creep.pos.y == cur.y){
                if(block_creep.memory._move?.path
                        && !block_creep.pos.isNearTo(real_roomPos(block_creep.memory._move.dest))){
                    block_creep.moveByPath(block_creep.memory._move?.path)
                } else block_creep.move(reverse_dir[cur.direction])
            }
        }
        delete creep.room.memory._pos_hold?.[pos_str]
    }
    return creep.move(cur.direction);
}

const real_roomPos = function(fake:{x:number,y:number,room:string}){
    return new RoomPosition(fake.x,fake.y,fake.room)
}

const reverse_dir: {[dir in DirectionConstant]: DirectionConstant} = {
    1: 5,
    2: 6,
    3: 7,
    4: 8,
    5: 1,
    6: 2,
    7: 3,
    8: 4
}