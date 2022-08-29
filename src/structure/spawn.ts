import { body_generator } from "@/creep/config.body";
import { ceil, floor } from "lodash";

export const spawn_run = function(room: Room) {
    if(room.energyAvailable < 300) return
    const spawn = room.find(FIND_MY_SPAWNS).find(spawn => !spawn.spawning)
    if(!spawn) return
    const spawn_task = room.memory._spawn_queue[0]
    if(!spawn_task) return
    room.memory._spawn_queue.shift()

    Memory.creep_SN = (Memory.creep_SN + 1) % 1000
    const creep_name = 'c'+ Memory.creep_SN
    const generator = body_generator[spawn_task._body.generator]
    let workload = spawn_task._body.workload
    let ret = spawn.spawnCreep(generator(workload, 2), creep_name)
    while(ret == ERR_NOT_ENOUGH_ENERGY){
        workload = floor(workload/2)
        ret = spawn.spawnCreep(generator(workload, 2), creep_name)
    }

    const spawn_loop = Memory.rooms[spawn_task._caller.room_name]._spawn_loop[spawn_task._caller.looper]
    if(ret == OK){
        spawn_loop.reload_time = Game.time + spawn_loop.interval + 1
        Memory.creeps[creep_name] = { _class: spawn_task._class }
    } else {
        spawn_loop.reload_time = Game.time + 200
        console.log(spawn.name + ":" + creep_name + ":" + ret)
    }
}
