export const reserved_room_loop_handler: RoomLoopHandler<'reserved'> = {
    Observe: function (room: Room, pool: {}, looper: Looper) {
        return null
    },
    Source0: function (room: Room, pool: {}, looper: Looper) {
        return null
    },
    Source1: function (room: Room, pool: {}, looper: Looper) {
        return null
    },
    Reserve: function (room: Room) {
        const controller = room.controller;
        if (!controller)
            return null;
        const reservation = controller.reservation;
        if (reservation && reservation.username == 'absGeist' && reservation.ticksToEnd > 3000) {
            return null;
        }
        const posed: Posed<PrimitiveDescript<'reserveController'>> = {
            action: 'reserveController',
            args: [controller.id],
            pos: controller.pos
        };
        const main: CallbackBehavior<TargetedAction> = { ...{ bhvr_name: 'callbackful' }, ...posed };
        const move: CallbackBehavior<'approach'> = {
            ...{ bhvr_name: 'callbackful' },
            ...{ action: "approach", args: [posed.pos, 1] }
        };
        main[ERR_NOT_FOUND] = move;
        main[ERR_NOT_IN_RANGE] = move;
        return {
            _body: { generator: 'Cl', workload: 4, mobility: 1 },
            _class: { ...{ bhvr_name: 'callbackful' }, ...main }
        };
    },
    Build: function (room: Room, pool: {}, looper: Looper) {
        return null
    },
    Maintain: function (room: Room, pool: {}, looper: Looper) {
        return null
    },
    Collector: function (room: Room, pool: {}, looper: Looper) {
        return null
    }
}