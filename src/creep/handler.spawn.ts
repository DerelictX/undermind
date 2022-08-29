import { structure_updater } from "@/room/structure.updater"
import { static_updater } from "@/scanner/static"
import { class_memory_initializer } from "./config.behavior"

const spawn_handler: {[r in AnyRole]:(room:Room) => SpawnTask|null} = {
    HarvesterSource0: function (room: Room) {
        static_updater['sources'](room, room.memory._static)
        if (room.memory._static.H_srcs && room.memory._static.H_srcs[0])
            return 10
        return null
    },
    HarvesterSource1: function (room: Room) {
        static_updater['sources'](room, room.memory._static)
        if (room.memory._static.H_srcs && room.memory._static.H_srcs[1])
            return 10
        return null
    },
    HarvesterSource2: function (room: Room) {
        static_updater['sources'](room, room.memory._static)
        if (room.memory._static.H_srcs && room.memory._static.H_srcs[2])
            return 10
        return null
    },
    HarvesterMineral: function (room: Room) {
        static_updater['mineral'](room, room.memory._static)
        if (room.memory._static.H_mnrl && room.memory._static.H_mnrl[0])
            return 15
        return null
    },
    Upgrader: function (room: Room) {
        static_updater['controller'](room, room.memory._static)
        if (room.memory._static.W_ctrl && room.memory._static.W_ctrl[0])
            return 10
        return null
    },

    HarvesterDeposit: function (room: Room) {
        return null
    },
    Builder: function (room: Room) {
        const storage = room.storage
        if(!storage){
            if(room.find(FIND_MY_CONSTRUCTION_SITES).length)
                return 8
        } else {
            if(storage.store.energy > 180000)
                return 24
        }
        return null
    },
    Maintainer: function (room: Room) {
        return 8
    },
    EnergySupplier: function (room: Room) {
        if(room.storage?.my)
            return null
        return 12
    },

    Collector: function (room: Room) {
        structure_updater.containers(room)
        structure_updater.links(room)
        if(room.storage?.my)
            return 12
        return null
    },
    Supplier: function (room: Room) {
        structure_updater.unique(room)
        structure_updater.towers(room)
        if(room.storage?.my)
            return 12
        return null
    },
    Chemist: function (room: Room) {
        structure_updater.labs(room)
        return null
    },
}


export const spawn_loop = function(room: Room) {
    var role_name: AnyRole
    for(role_name in room.memory._spawn_loop){
        const spawn_loop = room.memory._spawn_loop[role_name]
        if(spawn_loop.reload_time > Game.time)
            continue
        
        const spawn_task = spawn_handler[role_name](room)       
        if(!spawn_task){
            spawn_loop.reload_time = Game.time + 400
            continue
        }

        spawn_loop.reload_time = Game.time + spawn_loop.interval
        const spawn_room = room.name
        Memory.rooms[spawn_room]._spawn_queue.push(spawn_task)
    }
}