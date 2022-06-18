import { body_generator, default_body_config } from "@/creep/body_config"
import { change_reaction } from "@/structure/lab"
import { static_updater } from "@/transport/scanner.static"
import { structure_updater } from "./structure.updater"

const spawn_handler: {[r in AnyRoleName]:(room:Room) => boolean} = {
    harvester_m: function(room:Room){
        static_updater.mineral(room)
        if(room.memory.tasks.harvest_m[0])
            return true
        return false
    },
    harvester_s0: function(room:Room){
        static_updater.source(room)
        if(!room.memory.tasks.harvest[0])
            return false

        const generator = body_generator[default_body_config['harvester_s0'].generator]
        let workload = 3
        if(room.controller && room.controller.level == 8)
            workload = 5
        room.memory.spawn['harvester_s0'].body_parts = generator(
            room.energyAvailable,workload)
        return true
    },
    harvester_s1: function(room:Room){
        static_updater.source(room)
        if(!room.memory.tasks.harvest[1])
            return false

        const generator = body_generator[default_body_config['harvester_s1'].generator]
        let workload = 3
        if(room.controller && room.controller.level == 8)
            workload = 5
        room.memory.spawn['harvester_s1'].body_parts = generator(
            room.energyAvailable,workload)
        return true
    },

    maintainer: function(room:Room){
        structure_updater.towers(room)
        return true
    },
    supplier: function(room:Room){
        structure_updater.labs(room)
        change_reaction(room)

        const generator = body_generator[default_body_config['supplier'].generator]
        let workload = room.controller?.level
        if(!workload) return false
        room.memory.spawn['supplier'].body_parts = generator(
            room.energyAvailable,workload)
        return true
    },
    collector: function(room:Room){
        structure_updater.containers(room)
        structure_updater.links(room)

        const generator = body_generator[default_body_config['collector'].generator]
        let workload = room.controller?.level
        if(!workload) return false
        room.memory.spawn['collector'].body_parts = generator(
            room.energyAvailable,workload)
        return true
    },

    upgrader_s: function(room:Room){
        static_updater.upgrade(room)
        room.memory.spawn['upgrader_s'].succ_interval = 1500
        if(room.storage && room.storage.my && room.storage.store['energy'] < 240000)
            return false
        if(room.memory.tasks.upgrade[0])
            return true
        return false
    },
    builder: function(room:Room){
        if(room.find(FIND_MY_CONSTRUCTION_SITES)[0])
            return true
        return false
    },
    fortifier: function(room:Room){
        room.memory.spawn['upgrader_s'].succ_interval = 1500
        if(room.storage && room.storage.store['energy'] > 270000)
            return true
        return false
    },

    healer: (room:Room) => false,
    melee: (room:Room) => false,
    ranged: (room:Room) => false,
    emergency: (room:Room) => false,
    pioneer: (room:Room) => false,
    reserver: function(room:Room){
        room.memory.spawn['reserver'].succ_interval = 1100
        return false
    },
}


export const spawn_loop = function(room: Room) {
    var role_name: AnyRoleName
    for(role_name in room.memory.spawn){
        const spawn = room.memory.spawn[role_name]
        
        if(spawn.succeed_time > Game.time)
            continue
        room.memory.spawn[role_name].succeed_time = Game.time + 1500
        if(room.memory.spawn[role_name].succ_interval < 300)
            room.memory.spawn[role_name].succ_interval = 300

        if(spawn_handler[role_name](room))
            room.memory.spawn[role_name].queued = 1
            
        if(room.memory.spawn[role_name].body_parts.length == 0){
            const generator = body_generator[default_body_config[role_name].generator]
            let workload = default_body_config[role_name].workload
            room.memory.spawn[role_name].body_parts = generator(
                room.energyAvailable,workload)
        }
        room.memory.spawn[role_name].boost_queue = []
    }
}