import { class_memory_initializer } from "@/creep/config.behavior";
import { body_generator, default_body_config } from "@/creep/config.body";

export const spawn_run = function(room: Room) {
    if(room.energyAvailable < 300) return
    const spawn = room.find(FIND_MY_SPAWNS).find(spawn => !spawn.spawning)
    if(!spawn) return

    const spawn_task = room.memory._spawn_queue[0]
    if(!spawn_task) return
    room.memory._spawn_queue.shift()

    const role_name: AnyRole = spawn_task.role_name
    const generator = body_generator[default_body_config[role_name].generator]
    const body_parts = generator(room.energyAvailable, spawn_task.workload)
    const creep_name = role_name +'_'+ room.name +'_'+ Game.time % 10000
    
    const ret = spawn.spawnCreep(body_parts, creep_name)
    const spawn_loop = Memory.rooms[spawn_task.room_name]._spawn_loop[role_name]
    if(ret == OK){
        spawn_loop.reload_time = Game.time + spawn_loop.interval + 10
        if(role_name == 'HarvesterDeposit' || role_name == 'HarvesterMineral')
            return
        Memory.creeps[creep_name] = { _class: spawn_task._class }
    } else {
        spawn_loop.reload_time = Game.time + 400
        console.log(spawn.name + ":" + creep_name + ":" + ret)
    }
}
