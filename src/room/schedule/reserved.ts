import { autoRoadCallback } from "@/move/roomCallback"
import { init_carrier_behavior, init_worker_behavior } from "@/role/initializer/config.behavior"

export const reserved_room_loop_handler = {
    Fortify: function (room: Room, looper: Looper) {
        const storage = room.storage
        looper.interval = 1500
        if (room.controller?.level != 8 && !room.find(FIND_MY_CONSTRUCTION_SITES).length)
            return null
        if(Game.cpu.bucket < 9950)
            return null
        if (storage && storage.store.energy <= 80000)
            return null
        if (room.memory._struct && room.memory._struct.wall_hits > 50000000){
            return null
        }
        return {
            _body: { generator: 'WC', workload: 32 },
            _class: init_worker_behavior('Builder', room.name, room.name)
        }
    },
    Build: function (room: Room, pool: {}, looper: Looper) {
        let workload = room.find(FIND_MY_CONSTRUCTION_SITES).length
        if (workload < 3) {
            looper.interval = 600
            return null
        }
        looper.interval = 1500
        return {
            _body: { generator: 'WC', workload: 12 },
            _class: init_worker_behavior('RMaintainer', room.name, room.name)
        }
    },
    Maintain: function (room: Room, looper: Looper) {
        const decayed = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType == STRUCTURE_ROAD
                    || structure.structureType == STRUCTURE_CONTAINER)
                    return structure.hits < structure.hitsMax * 0.5
                return false
            }
        })
        if (!decayed.length)
            return null
        return {
            _body: { generator: 'WC', workload: 8 },
            _class: init_worker_behavior('Maintainer', room.name, room.name)
        }
    }
}

const A_core = function (room: Room, looper: Looper) {
    looper.interval = 600
    const core = room.find(FIND_HOSTILE_STRUCTURES,{
        filter: (structure) => {
            return structure.structureType == 'invaderCore'
        }
    })[0]
    if(!core) return null
    const attack: CallbackBehavior<'attack'> = {
        action: 'attack',
        args: [core.id], pos: core.pos
    }
    const bhvr: StaticMemory = {
        bhvr_name:  "static",
        state:      "collect",
        collect:    [attack],
        consume:    [],
    }
    return {
        _body: { generator: 'A', workload: 12, mobility: 1 },
        _class: bhvr
    }
}

const createHarvestRoad = function(fromPos: RoomPosition, toPos: RoomPosition) {
    const path = PathFinder.search(fromPos, {pos:toPos,range:1}, {
        plainCost: 2, swampCost: 10, maxRooms: 2,
        roomCallback:autoRoadCallback
    })
    const containerPos = path.path.pop()
    for (let pos of path.path) {
        Game.rooms[pos.roomName].createConstructionSite(pos,STRUCTURE_ROAD)
    }
    if(containerPos)
        Game.rooms[containerPos.roomName].createConstructionSite(containerPos,STRUCTURE_CONTAINER)
}
