import { class_memory_initializer } from "@/creep/config.behavior";
import { body_generator, default_body_config } from "@/creep/config.body";

export const spawn_run = function(room: Room) {
    if(room.energyAvailable < 300)
        return
    const spawn = room.find(FIND_MY_SPAWNS).find(spawn => !spawn.spawning)
    if(!spawn)return

    let role_name: AnyRole
    for(role_name in room.memory._spawn){
        const spawn_loop = room.memory._spawn[role_name]
        if(spawn_loop.queued == 1){
            let body_parts = spawn_loop.body_parts
            const creep_name = role_name
                +'_'+ room.name +'_'+ Game.time%10000
            
            let ret = spawn.spawnCreep(body_parts, creep_name)
            if(ret == ERR_NOT_ENOUGH_ENERGY || ret == ERR_INVALID_ARGS){
                const generator = body_generator[default_body_config[role_name].generator]
                body_parts = generator(room.energyAvailable,default_body_config[role_name].workload)
                ret = spawn.spawnCreep(body_parts, creep_name)
            }
            if(ret == OK){
                room.memory._spawn[role_name].queued = 0
                room.memory._spawn[role_name].reload_time = Game.time
                    + spawn_loop.interval + 10
                if(role_name == 'HarvesterDeposit' || role_name == 'HarvesterMineral'){
                    break
                }
                Memory.creeps[creep_name] = {
                    _class: class_memory_initializer[role_name](room.name,room.name)
                }
                return
            } else {
                console.log(spawn.name+":"+creep_name+":"+ret)
            }
        }
    }
}
