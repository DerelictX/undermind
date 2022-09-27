import { autoRoadCallback } from "@/move/roomCallback"
import { init_carrier_behavior, init_worker_behavior } from "@/role/initializer/config.behavior"
import { static_updater } from "@/scanner/static"

export const reserved_room_loop_handler: RoomLoopHandler<'reserved'> = {
    Observe: function (room: Room, pool: {}, looper: Looper) {
        looper.interval = 600
        const core = room.find(FIND_HOSTILE_STRUCTURES,{
            filter: (structure) => {
                return structure.structureType == 'invaderCore'
            }
        })[0]
        if(!core) return null
        const attack: CallbackBehavior<'attack'> = {
            bhvr_name: 'callbackful', action: 'attack',
            args: [core.id], pos: core.pos
        }
        return {
            _body: { generator: 'A', workload: 12, mobility: 1 },
            _class: attack
        }
    },
    Source0: function (room: Room, pool: SourceTaskPool, looper: Looper) {
        looper.interval = 1500
        static_updater['sources'](room, pool)
        if (!pool.H_srcs[0])
            return null
        
        const storage = Game.rooms[room.memory._spawn]?.storage
        const source = Game.getObjectById(pool.H_srcs[0].args[0])
        if (storage && source) {
            const path = PathFinder.search(storage.pos, {pos:source.pos,range:1}, {
                plainCost: 2, swampCost: 10, maxRooms: 2,
                roomCallback:autoRoadCallback
            })
            const containerPos = path.path.pop()
            for (let pos of path.path) {
                Game.rooms[pos.roomName].createConstructionSite(pos,STRUCTURE_ROAD)
            }
            if(containerPos)
                room.createConstructionSite(containerPos,STRUCTURE_CONTAINER)
        }

        if (!pool.T_src0[0]) {
            const posed = pool.H_srcs[0]
            const main: CallbackBehavior<'harvest'> = { bhvr_name: 'callbackful', ...posed }
            return {
                _body: { generator: 'W', workload: 5, mobility: 1 },
                _class: { ...{ bhvr_name: 'callbackful' }, ...main }
            }
        }
        return {
            _body: { generator: 'Wc', workload: 10 },
            _class: init_worker_behavior('HarvesterSource0', room.name, room.name)
        }
    },
    Source1: function (room: Room, pool: SourceTaskPool, looper: Looper) {
        looper.interval = 1500
        static_updater['sources'](room,pool)
        if (!pool.H_srcs?.[1])
            return null

        const storage = Game.rooms[room.memory._spawn]?.storage
        const source = Game.getObjectById(pool.H_srcs[1].args[0])
        if (storage && source) {
            const path = PathFinder.search(storage.pos, {pos:source.pos,range:1}, {
                plainCost: 2, swampCost: 10, maxRooms: 2,
                roomCallback:autoRoadCallback
            })
            const containerPos = path.path.pop()
            for (let pos of path.path) {
                Game.rooms[pos.roomName].createConstructionSite(pos,STRUCTURE_ROAD)
            }
            if(containerPos)
                room.createConstructionSite(containerPos,STRUCTURE_CONTAINER)
        }

        if (!pool.T_src1[0]) {
            const posed = pool.H_srcs[1]
            const main: CallbackBehavior<'harvest'> = { bhvr_name: 'callbackful', ...posed }
            return {
                _body: { generator: 'W', workload: 5, mobility: 1 },
                _class: { ...{ bhvr_name: 'callbackful' }, ...main }
            }
        }
        return {
            _body: { generator: 'Wc', workload: 10 },
            _class: init_worker_behavior('HarvesterSource1', room.name, room.name)
        }
    },
    Reserve: function (room: Room, pool: {}, looper: Looper) {
        looper.interval = 600
        const controller = room.controller
        if (!controller)
            return null
        const reservation = controller.reservation
        if (reservation && reservation.username == Memory.username && reservation.ticksToEnd > 3000) {
            return null
        }
        const reserve: CallbackBehavior<'reserveController'> = {
            bhvr_name: 'callbackful',
            action: 'reserveController',
            args: [controller.id],
            pos: controller.pos
        }
        const attack: CallbackBehavior<'attackController'> = {
            bhvr_name: 'callbackful',
            action: 'attackController',
            args: [controller.id],
            pos: controller.pos
        }
        reserve[ERR_INVALID_TARGET] = attack
        return {
            _body: { generator: 'Cl', workload: 4, mobility: 1 },
            _class: reserve
        }
    },
    Build: function (room: Room, pool: {}, looper: Looper) {
        let workload = room.find(FIND_MY_CONSTRUCTION_SITES).length
        if (workload < 3) {
            looper.interval = 600
            return null
        }
        if (workload < 12) workload = 12
        if (workload > 12) workload = 24
        looper.interval = 1500
        return {
            _body: { generator: 'WC', workload: 12 },
            _class: init_worker_behavior('RMaintainer', room.name, room.name)
        }
    },
    Maintain: function (room: Room, pool: SourceTaskPool, looper: Looper) {
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
            _body: { generator: 'WC', workload: 12 },
            _class: init_worker_behavior('RMaintainer', room.name, room.name)
        }
    },
    Collector: function (room: Room, pool: SourceTaskPool, looper: Looper) {
        static_updater.containers(room,pool)
        let _spawn = room.memory._spawn
        looper.interval = 1500
        if(pool.H_srcs.length > 1 && pool.W_cntn.length > 0)
            looper.interval = 750
        return {
            _body: { generator: 'C', workload: 32 },
            _class: init_carrier_behavior('Collector', room.name, _spawn)
        }
    }
}