import { hikeTo } from "@/move/route"
import { TASK_COMPLETE, TASK_DOING, TASK_FAILED } from "@/performer/behavior.any"
import { perform_callback } from "@/performer/behavior.callback"
import { posed_task_updater } from "@/scanner/dynamic"
import { work_priority } from "./config.behavior"

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
                pool[source] = posed_task_updater[source](room)
            }
            const tasks = pool[source]
            if(tasks && tasks.length) {
                fb.collect.push(parse_posed_task(tasks[0]))
                tasks.shift()
                creep.say(source)
                return
            }
        }
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
                pool[sink] = posed_task_updater[sink](room)
            }
            const tasks = pool[sink]
            if(tasks && tasks.length) {
                fb.consume.push(parse_posed_task(tasks[0]))
                tasks.shift()
                creep.say(sink)
                return
            }
        }
    }
}

/**
 * 将缓存的任务，解析为能被perform_callback执行的格式，加上一些条件判断
 * @param posed 
 * @returns 
 */
const parse_posed_task = function(posed:PosedCreepTask<TargetedAction>):CallbackBehavior<AnyAction>{
    const main: CallbackBehavior<TargetedAction> = {...{bhvr_name:'callbackful'},...posed}
    const move: CallbackBehavior<'approach'> = {...{bhvr_name:'callbackful'},
            ...{action:"approach",args:[posed.pos,1]}}
    const hold: CallbackBehavior<'hold_place'> = {...{bhvr_name:'callbackful'},
            ...{action:'hold_place',args:[1]}}
    main[ERR_NOT_IN_RANGE] = move
    switch(main.action){
        case 'withdraw':
        case 'transfer':
        case 'pickup':
            main[OK] = TASK_COMPLETE
            return main
        case 'harvest':
        case 'dismantle':
            const full_store: CallbackBehavior<'prejudge_full'> = {...{bhvr_name:'callbackful'},
                    ...{action:"prejudge_full",args:[0]}}
            full_store[OK] = main
            return full_store
        case 'repair':
            const full_hits: CallbackBehavior<'full_hits'> = {...{bhvr_name:'callbackful'},
                    ...{action:"full_hits",args:[main.args[0],0]}}
            full_hits[OK] = main
            return full_hits
        case 'build':
        case 'upgradeController':
            return main
        default: throw new Error("Unexpected state: " + main.action)
    }
}