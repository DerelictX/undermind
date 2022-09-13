import _ from "lodash"
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
    if(creep.room.name == _hike.route[0].room){
        _hike.from = _hike.route[0].room
        _hike.route.shift()
    }
    if(creep.room.name != _hike.from){
        creep.say('...')
        return ERR_TIRED
    }

    if(creep.memory._move){
        const exit = real_roomPos(creep.memory._move.dest)
        const a = (_hike.route[0].exit == TOP || _hike.route[0].exit == BOTTOM) ? exit.y : exit.x
        const b = (_hike.route[0].exit == TOP || _hike.route[0].exit == LEFT) ? 0 : 49
        if(a == b && exit.roomName == creep.room.name)
            return crawlTo(creep,exit)
        delete creep.memory._move
    }

    //分段寻路优化，在当前房间和下一个房间寻路，用来优化通往下个房间的exit
    if(_hike.route[1]){
        //从内存获取下个房间通往下下个房间的exits
        const exit_cache = Memory._route[_hike.route[0].room]?.[_hike.route[1].room]
        if(exit_cache){
            const exits: RoomPosition[] = []
            for(const pos of exit_cache)
                exits.push(new RoomPosition(pos.x,pos.y,pos.roomName))
            const path = PathFinder.search(creep.pos,exits)
            //在房间交界处截断，获取exit
            const exit = _.findLast(path.path, (pos) => pos.roomName == _hike.from)
            console.log(_hike.from + ' ->\t' + exit + ' ->\t' + _hike.route[1].room)
            return exit ? crawlTo(creep,exit) : ERR_NO_PATH
        } else {
            //update_exit(_hike.from)
            creep.say('.....')
            return ERR_TIRED
        }
    } else {
        //终点在下个房间
        const path = PathFinder.search(creep.pos,targetPos)
        const exit = _.findLast(path.path, (pos) => pos.roomName == _hike.from)
        console.log(_hike.from + ' ->\t' + exit + ' ->\t' + targetPos)
        return exit ? crawlTo(creep,exit) : ERR_NO_PATH
    }
}

const seekTo = function(creep:Creep|PowerCreep, toRoom:string){
    if(!creep.room) return ERR_NOT_FOUND
    delete creep.memory._hike;
    const route = Game.map.findRoute(creep.room, toRoom, {routeCallback:routeCallback});
    if(route == ERR_NO_PATH || route.length <= 0) {
        return ERR_NO_PATH
    }
    creep.memory._hike = {
        from:   creep.room.name,
        to:     toRoom,
        route:  route
    }
    update_exit(creep.room.name)
    for(let step of route){
        update_exit(step.room)
    }
    return OK
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

export const update_exit = function(roomName:string){
    if(!Memory._route[roomName])
        Memory._route[roomName] = {}
    const _route = Memory._route[roomName]
    if(!_route) return
    console.log('update_exit('+ roomName +')')
    
    const terrain = Game.map.getRoomTerrain(roomName)
    const exitRoom = Game.map.describeExits(roomName)
    if(exitRoom[TOP]){
        _route[exitRoom[TOP]] = []
        for(let x = 1; x <= 48; x++){
            if(!terrain.get(x,0) && (terrain.get(x-1,0) || terrain.get(x+1,0))){
                const pos = new RoomPosition(x,0,roomName)
                _route[exitRoom[TOP]].push(pos)
            }
        }
    }
    if(exitRoom[RIGHT]){
        _route[exitRoom[RIGHT]] = []
        for(let y = 1; y <= 48; y++){
            if(!terrain.get(49,y) && (terrain.get(49,y-1) || terrain.get(49,y+1))){
                const pos = new RoomPosition(49,y,roomName)
                _route[exitRoom[RIGHT]].push(pos)
            }
        }
    }
    if(exitRoom[BOTTOM]){
        _route[exitRoom[BOTTOM]] = []
        for(let x = 1; x <= 48; x++){
            if(!terrain.get(x,49) && (terrain.get(x-1,49) || terrain.get(x+1,49))){
                const pos = new RoomPosition(x,49,roomName)
                _route[exitRoom[BOTTOM]].push(pos)
            }
        }
    }
    if(exitRoom[LEFT]){
        _route[exitRoom[LEFT]] = []
        for(let y = 1; y <= 48; y++){
            if(!terrain.get(0,y) && (terrain.get(0,y-1) || terrain.get(0,y+1))){
                const pos = new RoomPosition(0,y,roomName)
                _route[exitRoom[LEFT]].push(pos)
            }
        }
    }
}