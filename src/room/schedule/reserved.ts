import { init_carrier_behavior, init_worker_behavior } from "@/role/config.behavior"
import { static_updater } from "@/scanner/static"

export const reserved_room_loop_handler: RoomLoopHandler<'reserved'> = {
    Observe: function (room: Room, pool: {}, looper: Looper) {
        return null
    },
    Source0: function (room: Room, pool: SourceTaskPool, looper: Looper) {
        static_updater['sources'](room, pool)
        if (!pool.H_srcs[0])
            return null
        if (!room.find(FIND_MY_CONSTRUCTION_SITES).length) {
            const storage = Game.rooms[room.memory._spawn]?.storage
            const source = Game.getObjectById(pool.H_srcs[0].args[0])
            if (storage && source) {
                const path = PathFinder.search(storage.pos, source.pos, {
                    plainCost: 2, swampCost: 10, maxRooms: 2,
                    roomCallback:autoRoadCallback
                })
                const containerPos = path.path.pop()
                if(containerPos)
                    room.createConstructionSite(containerPos,STRUCTURE_CONTAINER)
                for (let pos of path.path) {
                    Game.rooms[pos.roomName].createConstructionSite(pos,STRUCTURE_ROAD)
                }
            }
        }
        if (!pool.T_src0[0]) {
            const posed = pool.H_srcs[0]
            const main: CallbackBehavior<TargetedAction> = { ...{ bhvr_name: 'callbackful' }, ...posed }
            const move: CallbackBehavior<'approach'> = {
                ...{ bhvr_name: 'callbackful' },
                ...{ action: "approach", args: [posed.pos, 1] }
            }
            main[ERR_NOT_FOUND] = move
            main[ERR_NOT_IN_RANGE] = move
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
        static_updater['sources'](room,pool)
        if (!pool.H_srcs?.[1])
            return null
        if (!room.find(FIND_MY_CONSTRUCTION_SITES).length) {
            const storage = Game.rooms[room.memory._spawn]?.storage
            const source = Game.getObjectById(pool.H_srcs[1].args[0])
            if (storage && source) {
                const path = PathFinder.search(storage.pos, source.pos, {
                    plainCost: 2, swampCost: 10, maxRooms: 2,
                    roomCallback:autoRoadCallback
                })
                const containerPos = path.path.pop()
                if(containerPos)
                    room.createConstructionSite(containerPos,STRUCTURE_CONTAINER)
                for (let pos of path.path) {
                    Game.rooms[pos.roomName].createConstructionSite(pos,STRUCTURE_ROAD)
                }
            }
        }
        if (!pool.T_src1[0]) {
            const posed = pool.H_srcs[1]
            const main: CallbackBehavior<TargetedAction> = { ...{ bhvr_name: 'callbackful' }, ...posed }
            const move: CallbackBehavior<'approach'> = {
                ...{ bhvr_name: 'callbackful' },
                ...{ action: "approach", args: [posed.pos, 1] }
            }
            main[ERR_NOT_FOUND] = move
            main[ERR_NOT_IN_RANGE] = move
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
        if (room.find(FIND_HOSTILE_STRUCTURES).length)
            return null
        const controller = room.controller
        if (!controller)
            return null
        const reservation = controller.reservation
        if (reservation && reservation.username == 'absGeist' && reservation.ticksToEnd > 3000) {
            return null
        }
        const posed: Posed<PrimitiveDescript<'reserveController'>> = {
            action: 'reserveController',
            args: [controller.id],
            pos: controller.pos
        }
        const main: CallbackBehavior<TargetedAction> = { ...{ bhvr_name: 'callbackful' }, ...posed }
        const move: CallbackBehavior<'approach'> = {
            ...{ bhvr_name: 'callbackful' },
            ...{ action: "approach", args: [posed.pos, 1] }
        }
        main[ERR_NOT_FOUND] = move
        main[ERR_NOT_IN_RANGE] = move
        return {
            _body: { generator: 'Cl', workload: 4, mobility: 1 },
            _class: { ...{ bhvr_name: 'callbackful' }, ...main }
        }
    },
    Build: function (room: Room, pool: {}, looper: Looper) {
        if (!room.find(FIND_MY_CONSTRUCTION_SITES).length){
            looper.interval = 600
            return null
        }
        looper.interval = 1500
        return {
            _body: { generator: 'WC', workload: 12 },
            _class: init_worker_behavior('Builder', room.name, room.name)
        }
    },
    Maintain: function (room: Room, pool: {}, looper: Looper) {
        return null
    },
    Collector: function (room: Room, pool: SourceTaskPool, looper: Looper) {
        let _spawn = room.memory._spawn
        looper.interval = 1500
        if(pool.W_cntn.length > 1)
            looper.interval = 750
        return {
            _body: { generator: 'C', workload: 32 },
            _class: init_carrier_behavior('Collector', room.name, _spawn)
        }
    }
}

const autoRoadCallback = function(roomName:string):boolean | CostMatrix{
    let room = Game.rooms[roomName];
    if (!room) return false;
    let costs = new PathFinder.CostMatrix;

    room.find(FIND_STRUCTURES).forEach(function(struct) {
    if (struct.structureType === STRUCTURE_ROAD) {
        // Favor roads over plain tiles
        costs.set(struct.pos.x, struct.pos.y, 1);
    } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                (struct.structureType !== STRUCTURE_RAMPART ||
                !struct.my)) {
        // Can't walk through non-walkable buildings
        costs.set(struct.pos.x, struct.pos.y, 0xff);
    }
    });
    return costs;
}