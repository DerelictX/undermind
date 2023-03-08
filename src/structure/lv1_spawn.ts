import { body_generator } from "@/constant/config.body";
import { ceil, floor } from "lodash";

export const spawn_run = function(room: Room) {
    if(room.energyAvailable < 300) return
    const spawns = room.find(FIND_MY_SPAWNS,{
        filter: (spawn) => !spawn.spawning
    })
    const spawn = spawns[0]
    if(!room.memory.spawns || !spawn) return

    let spawn_task = room.memory.spawns.t1.shift()
    if(!spawn_task && spawns[1])
        spawn_task = room.memory.spawns.t2.shift()
    if(!spawn_task && spawns[2])
        spawn_task = room.memory.spawns.t3.shift()
    if(!spawn_task) return

    /**生爬 */
    Memory.creep_SN = (Memory.creep_SN + 1) % 1000
    const creep_name = 'c'+ Memory.creep_SN
    const generator = body_generator[spawn_task._body.generator]
    let workload = spawn_task._body.workload
    let mobility = spawn_task._body.mobility
    if(!mobility) mobility = 2
    
    let ret = spawn.spawnCreep(generator(workload, mobility), creep_name)
    while(ret == ERR_NOT_ENOUGH_ENERGY){
        workload = floor(workload/2)
        ret = spawn.spawnCreep(generator(workload, mobility), creep_name)
    }

    const caller = spawn_task._caller
    let looper: Looper|undefined
    switch(caller.task_type){
        case '_source':     looper = Memory._loop_id[caller.loop_key]; break;
        case '_mineral':    looper = Memory._loop_id[caller.loop_key]; break;
        case '_deposit':    looper = Memory._loop_id[caller.loop_key]; break;
        case '_upgrade':    looper = Memory._loop_id[caller.loop_key]; break;
        case '_reserve':    looper = Memory._loop_id[caller.loop_key]; break;
    }
    if(!looper) return

    if(ret == OK){
        looper.reload_time = Game.time + looper.interval + 1
        /**creep内存赋值 */
        Memory.creeps[creep_name] = {
            _class:     spawn_task._class,
            _caller:    spawn_task._caller,
            _life:      {
                boost:      false,
                unboost:    false
            }
        }
    } else {
        looper.reload_time = Game.time + 200
        console.log(spawn.name + ":" + creep_name + ":" + ret)
    }
}
