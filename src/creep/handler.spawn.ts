import { structure_updater } from "@/room/structure.updater"
import { static_updater } from "@/scanner/static"
import { body_generator, default_body_config } from "./config.body"

const spawn_handler: {[r in AnyRole]:(room:Room) => boolean} = {
    HarvesterSource0: function (room: Room): boolean {
        static_updater['sources'](room, room.memory._static)
        if (room.memory._static.H_srcs && room.memory._static.H_srcs[0])
            return true
        return false
    },
    HarvesterSource1: function (room: Room): boolean {
        static_updater['sources'](room, room.memory._static)
        if (room.memory._static.H_srcs && room.memory._static.H_srcs[1])
            return true
        return false
    },
    HarvesterSource2: function (room: Room): boolean {
        static_updater['sources'](room, room.memory._static)
        if (room.memory._static.H_srcs && room.memory._static.H_srcs[2])
            return true
        return false
    },
    HarvesterMineral: function (room: Room): boolean {
        static_updater['mineral'](room, room.memory._static)
        if (room.memory._static.H_mnrl && room.memory._static.H_mnrl[0])
            return true
        return false
    },
    Upgrader: function (room: Room): boolean {
        static_updater['controller'](room, room.memory._static)
        if (room.memory._static.W_ctrl && room.memory._static.W_ctrl[0])
            return true
        return false
    },

    HarvesterDeposit: function (room: Room): boolean {
        return false
    },
    Builder: function (room: Room): boolean {
        return true
    },
    Maintainer: function (room: Room): boolean {
        return true
    },
    EnergySupplier: function (room: Room): boolean {
        return true
    },

    Collector: function (room: Room): boolean {
        structure_updater.containers(room)
        structure_updater.links(room)
        if(room.storage?.my)
            return true
        return false
    },
    Supplier: function (room: Room): boolean {
        structure_updater.unique(room)
        structure_updater.towers(room)
        if(room.storage?.my)
            return true
        return false
    },
    Chemist: function (room: Room): boolean {
        structure_updater.labs(room)
        return false
    },
}


export const spawn_loop = function(room: Room) {
    var role_name: AnyRole
    for(role_name in room.memory._spawn){
        const spawn = room.memory._spawn[role_name]
        
        if(spawn.reload_time > Game.time)
            continue
        spawn.reload_time = Game.time + spawn.interval
        if(spawn.interval < 200)
            spawn.interval = 200

        if(spawn_handler[role_name](room))
            spawn.queued = 1
            
        if(spawn.body_parts.length == 0){
            const generator = body_generator[default_body_config[role_name].generator]
            let workload = default_body_config[role_name].workload
            spawn.body_parts = generator(
                room.energyAvailable,workload)
        }
        spawn.boost_queue = []
    }
}