import { parse_posed_task } from "@/performer/behavior.callback"
import { init_carrier_behavior, init_worker_behavior } from "@/role/initializer/config.behavior"
import { static_updater } from "@/scanner/static"
import { check_components } from "@/structure/factory"
import { change_reaction } from "@/structure/lab"
import { structure_updater } from "../../scanner/structure.updater"

export const owned_room_loop_handler: RoomLoopHandler<'owned'> = {
    Source0: function (room: Room, pool: SourceTaskPool, looper: Looper) {
        static_updater['sources'](room,pool)
        const harvest = pool.H_srcs[0]
        if (!harvest) return null
        const bhvr: StaticMemory = {
            bhvr_name:  "static",
            state:      "collect",
            collect:    [harvest],
            consume:    pool.T_src0,
        }
        if (!bhvr.consume[0]) {
            return {
                _body: { generator: 'W', workload: 5 },
                _class: bhvr
            }
        }
        const controller = room.controller
        if(!controller?.my) return null
        let workload = room.controller?.level == 8 ? 15 : 10
        if(controller.level <= 3) workload = 4
        return {
            _body: { generator: 'Wc', workload: workload },
            _class: bhvr
        }
    },
    Source1: function (room: Room, pool: SourceTaskPool, looper: Looper) {
        static_updater['sources'](room,pool)
        const harvest = pool.H_srcs[1]
        if (!harvest) return null
        const bhvr: StaticMemory = {
            bhvr_name:  "static",
            state:      "collect",
            collect:    [harvest],
            consume:    pool.T_src1,
        }
        if (!bhvr.consume[0]) {
            return {
                _body: { generator: 'W', workload: 5 },
                _class: bhvr
            }
        }
        const controller = room.controller
        if(!controller?.my) return null
        let workload = room.controller?.level == 8 ? 15 : 10
        if(controller.level <= 3) workload = 4
        return {
            _body: { generator: 'Wc', workload: workload },
            _class: bhvr
        }
    },
    Mineral: function (room: Room, pool: MineralTaskPool, looper: Looper) {
        if (room.memory._typed._type != 'owned')
            return null
        static_updater.mineral(room,pool)
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

        const bhvr: StaticMemory = {
            bhvr_name:  "static",
            state:      "collect",
            collect:    [parse_posed_task(posed)],
            consume:    [parse_posed_task(stand)],
        }
        return {
            _body: { generator: 'Wc', workload: 25 },
            _class: bhvr
        }
    },
    Upgrade: function (room: Room, pool: OwnedTaskPool, looper: Looper) {
        static_updater.controller(room,pool)
        if (!pool.W_ctrl[0])
            return null
        if (!room.storage?.my || !room.controller || room.controller.level == 8)
            return null
        if (room.storage.store.energy <= 20000 * room.controller.level)
            return null
        looper.interval = 400
        return {
            _body: { generator: 'Wc', workload: 25 },
            _class: init_worker_behavior('Upgrader', room.name, room.name)
        }
    },
    Build: function (room: Room, pool: SourceTaskPool, looper: Looper) {
        const storage = room.storage
        looper.interval = 1500
        if (room.controller?.level != 8 && !room.find(FIND_MY_CONSTRUCTION_SITES).length)
            return null
        if(Game.cpu.bucket < 9950)
            return null
        if (storage && storage.store.energy <= 80000)
            return null
        if (room.memory._typed._type == 'owned'
                && room.memory._typed._struct.wall_hits > 50000000){
            return null
        }
        return {
            _body: { generator: 'WC', workload: 32 },
            _class: init_worker_behavior('Builder', room.name, room.name)
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
        looper.interval = 1450
        static_updater.containers(room,pool)
        if (!room.storage?.my){
            return {
                _body: { generator: 'C', workload: 16 },
                _class: init_worker_behavior('EnergySupplier', room.name, room.name)
            }
        }
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
        if (!room.storage?.my){
            return {
                _body: { generator: 'C', workload: 16 },
                _class: init_worker_behavior('EnergySupplier', room.name, room.name)
            }
        }
        return {
            _body: { generator: 'C', workload: 16 },
            _class: init_carrier_behavior('Supplier', room.name, room.name)
        }
    },
    Observe: function (room: Room, pool: {}, looper: Looper) {
        if (room.memory._typed._type != 'owned')
            return null
        structure_updater.labs(room, room.memory._typed._struct)
        change_reaction(room)
        check_components(room)
        Memory._closest_owned[room.name] = {
            root:   room.name,
            prev:   room.name,
            dist:   0,
            time:   Game.time
        }
        room.memory._typed._struct.observer.BFS_open = [room.name]
        looper.interval = 400
        return null
    }
}