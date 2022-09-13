import { init_carrier_behavior, init_worker_behavior } from "@/role/config.behavior"
import { static_updater } from "@/scanner/static"
import { structure_updater } from "../../scanner/structure.updater"

export const owned_room_loop_handler: RoomLoopHandler<'owned'> = {
    Source0: function (room: Room, pool: SourceTaskPool, looper: Looper) {
        static_updater['sources'](room,pool)
        if (!pool.H_srcs?.[0])
            return null
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
                _body: { generator: 'W', workload: 5 },
                _class: { ...{ bhvr_name: 'callbackful' }, ...main }
            }
        }
        return {
            _body: { generator: 'Wc', workload: 15 },
            _class: init_worker_behavior('HarvesterSource0', room.name, room.name)
        }
    },
    Source1: function (room: Room, pool: SourceTaskPool, looper: Looper) {
        static_updater['sources'](room,pool)
        if (!pool.H_srcs?.[1])
            return null
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
                _body: { generator: 'W', workload: 5 },
                _class: { ...{ bhvr_name: 'callbackful' }, ...main }
            }
        }
        return {
            _body: { generator: 'Wc', workload: 15 },
            _class: init_worker_behavior('HarvesterSource1', room.name, room.name)
        }
    },
    Mineral: function (room: Room, pool: MineralTaskPool, looper: Looper) {
        if (room.memory._typed._type != 'owned')
            return null
        static_updater['mineral'](room,pool)
        const posed = pool.H_mnrl[0]
        const stand = pool.T_mnrl[0]
        if (!posed || !stand)
            return null
        const mineral = Game.getObjectById(posed.args[0])
        const storage = room.storage
        if (!mineral || !storage)
            return null
        if (storage.store[mineral.mineralType] > 60000)
            return null

        const main: CallbackBehavior<'harvest'> = { ...{ bhvr_name: 'callbackful' }, ...posed }
        const move: CallbackBehavior<'approach'> = {
            ...{ bhvr_name: 'callbackful' },
            ...{ action: "approach", args: [stand.pos, 0] }
        }
        move[OK] = main
        return {
            _body: { generator: 'W', workload: 24 },
            _class: { ...{ bhvr_name: 'callbackful' }, ...move }
        }
    },
    Upgrade: function (room: Room, pool: OwnedTaskPool, looper: Looper) {
        if (room.memory._typed._type != 'owned')
            return null
        static_updater['controller'](room,pool)
        if (!pool.W_ctrl[0])
            return null
        if (room.controller?.level == 8)
            return null
        if (room.storage && room.storage.store.energy <= 150000)
            return null
        looper.interval = 1500
        return {
            _body: { generator: 'Wc', workload: 15 },
            _class: init_worker_behavior('Upgrader', room.name, room.name)
        }
    },
    Build: function (room: Room, pool: SourceTaskPool, looper: Looper) {
        const storage = room.storage
        if (!storage) {
            if (!room.find(FIND_MY_CONSTRUCTION_SITES).length)
                return null
            looper.interval = 1500
            return {
                _body: { generator: 'WC', workload: 12 },
                _class: init_worker_behavior('Builder', room.name, room.name)
            }
        } else {
            looper.interval = 900
            if (storage.store.energy <= 180000)
                return null
            return {
                _body: { generator: 'WC', workload: 32 },
                _class: init_worker_behavior('Builder', room.name, room.name)
            }
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
            _body: { generator: 'WC', workload: 8 },
            _class: init_worker_behavior('Maintainer', room.name, room.name)
        }
    },
    Collector: function (room: Room, pool: SourceTaskPool, looper: Looper) {
        static_updater.containers(room,pool)
        let _spawn = room.memory._spawn
        if (room.memory._typed._type == 'reserved') {
            looper.interval = 750
            return {
                _body: { generator: 'C', workload: 32 },
                _class: init_carrier_behavior('Collector', room.name, _spawn)
            }
        }

        if (!room.storage?.my)
            return null
        return {
            _body: { generator: 'C', workload: 16 },
            _class: init_carrier_behavior('Collector', room.name, room.name)
        }
    },
    Supplier: function (room: Room, pool: SourceTaskPool, looper: Looper) {
        if (room.memory._typed._type != 'owned')
            return null
        structure_updater.towers(room, room.memory._typed._struct)
        structure_updater.links(room, room.memory._typed._struct)
        structure_updater.unique(room, room.memory._typed._struct)
        if (!room.storage?.my)
            return null
        return {
            _body: { generator: 'C', workload: 16 },
            _class: init_carrier_behavior('Supplier', room.name, room.name)
        }
    },
    observe: function (room: Room, pool: {}, looper: Looper) {
        throw new Error("Function not implemented.")
    }
}