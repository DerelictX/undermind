import { static_updater } from "@/scanner/static"
import { body_generator, default_body_config } from "./config.body"

const spawn_handler: {[r in GeneralistRole]:(room:Room) => boolean} = {
    HarvesterSource0: function (room: Room): boolean {
        static_updater['sources'](room,room.memory._static)
        if(room.memory._static.H_srcs && room.memory._static.H_srcs[0])
            return true
        return false
    },
    HarvesterSource1: function (room: Room): boolean {
        static_updater['sources'](room,room.memory._static)
        if(room.memory._static.H_srcs && room.memory._static.H_srcs[1])
            return true
        return false
    },
    HarvesterSource2: function (room: Room): boolean {
        static_updater['sources'](room,room.memory._static)
        if(room.memory._static.H_srcs && room.memory._static.H_srcs[2])
            return true
        return false
    },
    HarvesterMineral: function (room: Room): boolean {
        static_updater['mineral'](room,room.memory._static)
        if(room.memory._static.H_mnrl && room.memory._static.H_mnrl[0])
            return true
        return false
    },
    Upgrader: function (room: Room): boolean {
        static_updater['controller'](room,room.memory._static)
        if(room.memory._static.W_ctrl && room.memory._static.W_ctrl[0])
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

    Collector: function (room: Room): boolean {
        return false
    },
    Supplier: function (room: Room): boolean {
        return false
    },
    Chemist: function (room: Room): boolean {
        return false
    }
}


export const spawn_loop = function(room: Room) {
    var role_name: GeneralistRole
    for(role_name in room.memory._spawn){
        const spawn = room.memory._spawn[role_name]
        
        if(spawn.reload_time > Game.time)
            continue
        room.memory._spawn[role_name].reload_time = Game.time + 1500
        if(room.memory._spawn[role_name].interval < 200)
            room.memory._spawn[role_name].interval = 200

        if(spawn_handler[role_name](room))
            room.memory._spawn[role_name].queued = 1
            
        if(room.memory._spawn[role_name].body_parts.length == 0){
            const generator = body_generator[default_body_config[role_name].generator]
            let workload = default_body_config[role_name].workload
            room.memory._spawn[role_name].body_parts = generator(
                room.energyAvailable,workload)
        }
        room.memory._spawn[role_name].boost_queue = []
    }
}