import { body_generator, default_body_config } from "./body_config"

const spawn_handler: {[r in CreepClassName]:(room:Room) => boolean} = {
    generalist: function (room: Room): boolean {
        return true
    },
    specialist: function (room: Room): boolean {
        return true
    },
    carrier: function (room: Room): boolean {
        return true
    },
    fighter: function (room: Room): boolean {
        return false
    }
}


export const spawn_loop = function(room: Room) {
    var role_name: CreepClassName
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