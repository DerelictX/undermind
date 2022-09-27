import { work_priority } from "@/role/initializer/config.behavior"
import { hikeTo } from "@/move/route"
import { parse_posed_task, perform_callback, TASK_COMPLETE, TASK_DOING } from "@/performer/behavior.callback"
import { update_pool } from "@/scanner/dynamic"

export const run_worker = function(creep:Creep,fb:WorkerMemory){
    if(fb.state == 'collect'){
        if(run_worker_collect(creep,fb) == TASK_COMPLETE)
            run_worker_consume(creep,fb)
    }
    else if(fb.state == 'consume'){
        if(run_worker_consume(creep,fb) == TASK_COMPLETE)
            run_worker_collect(creep,fb)
    }
}

const run_worker_collect = function(creep:Creep,fb:WorkerMemory){
    if(!fb.collect.length){
        if(creep.store.getFreeCapacity('energy') == 0){
            fb.state = 'consume'
            return TASK_COMPLETE
        }
        change_flow(creep,fb)
        if(!fb.collect.length) return TASK_DOING
    }
    const ret = perform_callback(creep,fb.collect[0])
    if(ret != TASK_DOING) {
        fb.collect.shift()
        if(!fb.collect.length && creep.store.getFreeCapacity('energy') == 0){
            fb.state = 'consume'
            return TASK_COMPLETE
        }
    }
    return TASK_DOING
}

const run_worker_consume = function(creep:Creep,fb:WorkerMemory){
    if(!fb.consume.length) {
        if(creep.store.getUsedCapacity('energy') == 0){
            fb.state = 'collect'
            return TASK_COMPLETE
        }
        change_flow(creep,fb)
        if(!fb.consume.length) return TASK_DOING
    }
    const ret = perform_callback(creep,fb.consume[0])
    if(ret != TASK_DOING) {
        fb.consume.shift()
        if(!fb.consume.length && creep.store.getUsedCapacity('energy') == 0){
            fb.state = 'collect'
            return TASK_COMPLETE
        }
    }
    return TASK_DOING
}

const change_flow = function(creep:Creep,fb:WorkerMemory) {
    const flow = work_priority[fb.priority]
    if(fb.state == 'collect'){
        const pool = Memory.rooms[fb.fromRoom]._dynamic
        const room = Game.rooms[fb.fromRoom]
        if(creep.room.name != fb.fromRoom){
            hikeTo(creep,new RoomPosition(25,25,fb.fromRoom))
            return
        }
        for(let source of flow[0]){
            if(!pool[source]?.length){
                update_pool(pool,source,room)
            }
            const tasks = pool[source]
            if(tasks && tasks.length) {
                fb.collect.push(parse_posed_task(tasks[0]))
                tasks.shift()
                creep.say(source)
                return
            }
        }
        delete creep.memory._move
    }
    if(fb.state == 'consume'){
        const pool = Memory.rooms[fb.toRoom]._dynamic
        const room = Game.rooms[fb.toRoom]
        if(creep.room.name != fb.toRoom){
            hikeTo(creep,new RoomPosition(25,25,fb.toRoom))
            return
        }
        for(let sink of flow[1]){
            if(!pool[sink]?.length){
                update_pool(pool,sink,room)
            }
            const tasks = pool[sink]
            if(tasks && tasks.length) {
                fb.consume.push(parse_posed_task(tasks[0]))
                tasks.shift()
                creep.say(sink)
                return
            }
        }
        delete creep.memory._move
    }
}
