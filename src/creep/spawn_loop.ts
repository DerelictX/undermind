import { body_generator, default_body_config } from "./config.body"

const spawn_handler: {[r in GeneralistRole]:(room:Room) => boolean} = {
    HS0: function (room: Room): boolean {
        return false
    },
    HS1: function (room: Room): boolean {
        return false
    },
    HS2: function (room: Room): boolean {
        return false
    },
    HM: function (room: Room): boolean {
        return false
    },
    Up: function (room: Room): boolean {
        return false
    },
    HD: function (room: Room): boolean {
        return false
    },
    Bu: function (room: Room): boolean {
        return false
    },
    Ma: function (room: Room): boolean {
        return false
    },
    Co: function (room: Room): boolean {
        return false
    },
    Su: function (room: Room): boolean {
        return false
    },
    Ch: function (room: Room): boolean {
        return false
    }
}


export const spawn_loop = function(room: Room) {
    var role_name: GeneralistRole
    for(role_name in room.memory._spawn){
        const spawn = room.memory._spawn[role_name]
        
        if(spawn.reload_time > Game.time)
            continue
        room.memory._spawn[role_name].reload_time = Game.time + 400
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