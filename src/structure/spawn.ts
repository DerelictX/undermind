import { body_generator, default_body_config } from "@/creep/config.body";
import { ceil } from "lodash";

export const spawn_run = function(room: Room) {
    if(room.energyAvailable < 300) return
    const spawn = room.find(FIND_MY_SPAWNS).find(spawn => !spawn.spawning)
    if(!spawn) return

    const spawn_task = room.memory._spawn_queue[0]
    if(!spawn_task) return
    room.memory._spawn_queue.shift()

    const role_name: AnyRole = spawn_task.role_name
    const generator = body_generator[default_body_config[role_name]]
    const creep_name = role_name +'_'+ room.name +'T'+ Game.time % 10000
    const spawn_loop = Memory.rooms[spawn_task.room_name]._spawn_loop[role_name]

    let ret = spawn.spawnCreep(generator(spawn_task.workload, 1), creep_name)
    if(ret == ERR_NOT_ENOUGH_ENERGY){
        ret = spawn.spawnCreep(generator(ceil(spawn_task.workload/2), 1), creep_name)
    }

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
