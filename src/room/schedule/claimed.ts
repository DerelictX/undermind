import { init_worker_behavior } from "@/role/initializer/config.behavior"
import { static_updater } from "@/scanner/static"

export const claimed_room_loop_handler: RoomLoopHandler<'claimed'> = {
    Observe: function (room: Room, pool: {}, looper: Looper): RoleImpl | null {
        return null
    },
    Upgrade: function (room: Room, pool: OwnedTaskPool, looper: Looper): RoleImpl | null {
        looper.interval = 600
        return {
            _body: { generator: 'WC', workload: 24, mobility: 1 },
            _class: init_worker_behavior('Builder', room.name, room.name)
        }
    },
    Build: function (room: Room, pool: SourceTaskPool, looper: Looper): RoleImpl | null {
        static_updater.sources(room,pool)
        looper.interval = 600
        return {
            _body: { generator: 'WC', workload: 24, mobility: 1 },
            _class: init_worker_behavior('Builder', room.name, room.name)
        }
    },
    Claim: function (room: Room, pool: {}, looper: Looper): RoleImpl | null {
        const controller = room.controller
        if (!controller || controller.my)
            return null
        const claim: CallbackBehavior<'claimController'> = {
            action: 'claimController',
            args: [controller.id],
            pos: controller.pos
        }
        const bhvr: StaticMemory = {
            bhvr_name:  "static",
            state:      "collect",
            collect:    [claim],
            consume:    [],
        }
        return {
            _body: { generator: 'Cl', workload: 1, mobility: 1 },
            _class: bhvr
        }
    }
}