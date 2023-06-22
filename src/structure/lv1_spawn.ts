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
    const creep_name = spawn_task._body.generator + Memory.creep_SN
    const generator = body_generator[spawn_task._body.generator]
    let workload = spawn_task._body.workload
    let mobility = spawn_task._body.mobility
    let boost = spawn_task._body.boost
    if(!mobility) mobility = 2

    const caller = spawn_task._caller
    let looper: Looper|undefined
    switch(caller.loop_type){
        case '_loop_id':
            looper = Memory._loop_id[caller.loop_key]
            break
        case '_loop_room':
            looper = Memory._loop_room[caller.loop_key]?.[caller.task_type]
            break
        case '_loop_flag':
            looper = Memory._loop_flag[caller.loop_key]
            break
    }
    if(!looper) return

    let ret = spawn.spawnCreep(generator(workload, mobility), creep_name)
    while(ret == ERR_NOT_ENOUGH_ENERGY && workload > 0){
        workload = floor(workload/2)
        ret = spawn.spawnCreep(generator(workload, mobility), creep_name)
    }
    if(ret == OK){
        looper.reload_time = Game.time + looper.interval + 1
        /**creep内存赋值 */
        Memory.creeps[creep_name] = {
            _class:     spawn_task._class,
            _caller:    spawn_task._caller,
            _life:      {
                boost:      boost ? room.name : null,
                unboost:    null
            }
        }
    } else {
        looper.reload_time = Game.time + 200
        console.log(spawn.name + ":" + creep_name + ":" + ret)
    }
}

export const publish_spawn_task = function(task: SpawnTask<AnyLoopType>){
    const dest_room = task._caller.dest_room
    const queue = Memory.rooms[dest_room]?.spawns?.t1
    if(queue && queue.length < 20) queue.push(task)
}