export const highway_room_loop_handler: RoomLoopHandler<'highway'> = {
    Deposit: function (room: Room, pool: HighwayTaskPool, looper: Looper) {
        if (room.memory._typed._type != 'highway')
            return null
        const deposit = room.find(FIND_DEPOSITS, {
            filter: (deposit) => deposit.lastCooldown < 50
        })[0]
        const storage = Game.rooms[room.memory._spawn]?.storage
        if (!deposit || !storage){
            looper.interval = 500
            return null
        }

        const main: CallbackBehavior<'harvest'> = {
            bhvr_name: 'callbackful', action: 'harvest',
            args: [deposit.id], pos: deposit.pos
        }
        const back: CallbackBehavior<'transfer'> = {
            bhvr_name: 'callbackful', action: 'transfer',
            args: [storage.id, deposit.depositType], pos: storage.pos
        }
        main[ERR_FULL] = back
        const workload = deposit.lastCooldown < 5 ? 15 : 20
        looper.interval = 1400
        console.log(room.name + ' -> Deposit:\t' + deposit.pos)
        return {
            _body: { generator: 'DH', workload: workload, mobility: 1 },
            _class: main
        }
    },
    Observe: function (room: Room, pool: HighwayTaskPool, looper: Looper): RoleImpl | null {
        return null
    },
    Collector: function (room: Room, pool: HighwayTaskPool, looper: Looper): RoleImpl | null {
        return null
    }
}