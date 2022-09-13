export const highway_room_loop_handler: RoomLoopHandler<'highway'> = {
    Deposit: function (room: Room) {
        if (room.memory._typed._type != 'highway')
            return null
        const deposit = room.find(FIND_DEPOSITS, {
            filter: (deposit) => deposit.cooldown < 50
        })[0]
        const storage = Game.rooms[room.memory._spawn]?.storage
        if (!deposit || !storage)
            return null

        const main: CallbackBehavior<'harvest'> = {
            bhvr_name: 'callbackful', action: 'harvest', args: [deposit.id]
        }
        main[ERR_NOT_IN_RANGE] = main[ERR_NOT_FOUND] = {
            bhvr_name: 'callbackful', action: 'approach', args: [deposit.pos, 1]
        }
        const back: CallbackBehavior<'transfer'> = {
            bhvr_name: 'callbackful', action: 'transfer', args: [storage.id, deposit.depositType]
        }
        back[ERR_NOT_IN_RANGE] = {
            bhvr_name: 'callbackful', action: 'approach', args: [storage.pos, 1]
        }

        const full_store: CallbackBehavior<'prejudge_full'> = {
            bhvr_name: 'callbackful', action: "prejudge_full", args: [0]
        }
        full_store[OK] = main
        full_store[ERR_FULL] = back
        return {
            _body: { generator: 'DH', workload: 25, mobility: 1 },
            _class: full_store
        }
    },
    observe: function (room: Room, pool: HighwayTaskPool, looper: Looper): RoleImpl | null {
        throw new Error("Function not implemented.")
    },
    Collector: function (room: Room, pool: HighwayTaskPool, looper: Looper): RoleImpl | null {
        throw new Error("Function not implemented.")
    }
}