import { structure_updater } from "@/room/structure.updater"
import { static_updater } from "@/scanner/static"
import { init_carrier_behavior, init_worker_behavior } from "./config.behavior"

type RoleImpl = Omit<SpawnTask,'_caller'>
const spawn_handler: {[r in AnyRole]:(room:Room) => RoleImpl|null} = {
    HarvesterSource0: function (room: Room) {
        static_updater['sources'](room, room.memory._static)
        if (!room.memory._static.H_srcs?.at(0)) return null
        return {
            _body:{generator:'Wc',workload:10},
            _class:init_worker_behavior('HarvesterSource0',room.name,room.name)
        }
    },
    HarvesterSource1: function (room: Room) {
        static_updater['sources'](room, room.memory._static)
        if (!room.memory._static.H_srcs?.at(1)) return null
        return {
            _body:{generator:'Wc',workload:10},
            _class:init_worker_behavior('HarvesterSource1',room.name,room.name)
        }
    },
    HarvesterSource2: function (room: Room) {
        static_updater['sources'](room, room.memory._static)
        if (!room.memory._static.H_srcs?.at(2)) return null
        return {
            _body:{generator:'Wc',workload:10},
            _class:init_worker_behavior('HarvesterSource2',room.name,room.name)
        }
    },
    HarvesterMineral: function (room: Room) {
        static_updater['mineral'](room, room.memory._static)
        if (!room.memory._static.H_mnrl?.at(0)) return null
        return null
    },
    Upgrader: function (room: Room) {
        static_updater['controller'](room, room.memory._static)
        if (!room.memory._static.W_ctrl?.at(0)) return null
        return {
            _body:{generator:'Wc',workload:10},
            _class:init_worker_behavior('Upgrader',room.name,room.name)
        }
    },

    HarvesterDeposit: function (room: Room) {
        return null
    },
    Builder: function (room: Room) {
        const storage = room.storage
        if(!storage){
            if(!room.find(FIND_MY_CONSTRUCTION_SITES).length) return null
            return {
                _body:{generator:'WC',workload:12},
                _class:init_worker_behavior('Builder',room.name,room.name)
            }
        } else {
            if(storage.store.energy <= 180000) return null
            return {
                _body:{generator:'WC',workload:24},
                _class:init_worker_behavior('Builder',room.name,room.name)
            }
        }
    },
    Maintainer: function (room: Room) {
        return {
            _body:{generator:'WC',workload:8},
            _class:init_worker_behavior('Maintainer',room.name,room.name)
        }
    },
    EnergySupplier: function (room: Room) {
        if(!room.storage?.my) return null
        return {
            _body:{generator:'C',workload:12},
            _class:init_worker_behavior('EnergySupplier',room.name,room.name)
        }
    },

    Collector: function (room: Room) {
        static_updater.containers(room,room.memory._static)
        structure_updater.links(room,room.memory._static)
        if(!room.storage?.my) return null
        return {
            _body:{generator:'C',workload:12},
            _class:init_carrier_behavior('Collector',room.name,room.name)
        }
    },
    Supplier: function (room: Room) {
        structure_updater.unique(room,room.memory._static)
        structure_updater.towers(room,room.memory._static)
        if(!room.storage?.my) return null
        return {
            _body:{generator:'C',workload:12},
            _class:init_carrier_behavior('Supplier',room.name,room.name)
        }
    },
    Chemist: function (room: Room) {
        structure_updater.labs(room,room.memory._static)
        return null
    },
}


export const spawn_loop = function(room: Room) {
    var role_name: AnyRole
    for(role_name in room.memory._spawn_loop){
        const spawn_loop = room.memory._spawn_loop[role_name]
        if(spawn_loop.reload_time > Game.time)
            continue
        
        const role_impl = spawn_handler[role_name](room)
        if(!role_impl){
            spawn_loop.reload_time = Game.time + 400
            continue
        }

        spawn_loop.reload_time = Game.time + spawn_loop.interval
        const spawn_room = room.name
        const caller = {_caller:{room_name:room.name,looper:role_name}}
        Memory.rooms[spawn_room]._spawn_queue.push({...caller,...role_impl})
    }
}