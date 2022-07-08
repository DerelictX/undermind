import { structure_updater } from "@/room/structure.updater"
import { static_updater } from "@/scanner/static"
import { class_memory_initializer } from "./config.behavior"

const spawn_handler: {[r in AnyRole]:(room:Room) => number} = {
    HarvesterSource0: function (room: Room): number {
        static_updater['sources'](room, room.memory._static)
        if (room.memory._static.H_srcs && room.memory._static.H_srcs[0])
            return 6
        return 0
    },
    HarvesterSource1: function (room: Room): number {
        static_updater['sources'](room, room.memory._static)
        if (room.memory._static.H_srcs && room.memory._static.H_srcs[1])
            return 6
        return 0
    },
    HarvesterSource2: function (room: Room): number {
        static_updater['sources'](room, room.memory._static)
        if (room.memory._static.H_srcs && room.memory._static.H_srcs[2])
            return 6
        return 0
    },
    HarvesterMineral: function (room: Room): number {
        static_updater['mineral'](room, room.memory._static)
        if (room.memory._static.H_mnrl && room.memory._static.H_mnrl[0])
            return 16
        return 0
    },
    Upgrader: function (room: Room): number {
        static_updater['controller'](room, room.memory._static)
        if (room.memory._static.W_ctrl && room.memory._static.W_ctrl[0])
            return 10
        return 0
    },

    HarvesterDeposit: function (room: Room): number {
        return 0
    },
    Builder: function (room: Room): number {
        return 6
    },
    Maintainer: function (room: Room): number {
        return 4
    },
    EnergySupplier: function (room: Room): number {
        return 12
    },

    Collector: function (room: Room): number {
        structure_updater.containers(room)
        structure_updater.links(room)
        if(room.storage?.my)
            return 12
        return 0
    },
    Supplier: function (room: Room): number {
        structure_updater.unique(room)
        structure_updater.towers(room)
        if(room.storage?.my)
            return 12
        return 0
    },
    Chemist: function (room: Room): number {
        structure_updater.labs(room)
        return 0
    },
}


export const spawn_loop = function(room: Room) {
    var role_name: AnyRole
    for(role_name in room.memory._spawn_loop){
        const spawn_loop = room.memory._spawn_loop[role_name]
        if(spawn_loop.reload_time > Game.time)
            continue
        if(role_name == 'HarvesterDeposit' || role_name == 'HarvesterMineral')
            continue
        const workload = spawn_handler[role_name](room)       
        if(workload){
            spawn_loop.reload_time = Game.time + 400
            continue
        }

        spawn_loop.reload_time = Game.time + spawn_loop.interval
        const spawn_room = room.name
        Memory.rooms[spawn_room]._spawn_queue.push({
            room_name:  room.name,
            role_name:  role_name,
            workload:   workload,
            _class:     class_memory_initializer[role_name](spawn_room,room.name)
        })
    }
}