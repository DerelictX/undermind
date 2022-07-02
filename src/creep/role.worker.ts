import { TASK_COMPLETE, TASK_DOING, TASK_FAILED } from "@/performer/behavior.any"
import { perform_callback } from "@/performer/behavior.callback"
import { posed_task_updater } from "@/scanner/dynamic"
import { work_priority } from "./config.behavior"

export const run_worker = function(creep:Creep,fb:WorkerMemory){
    if(fb.state == 'collect'){
        if(!fb.collect.length){
            change_flow(fb)
            if(!fb.collect.length) {
                fb.state = 'consume'
                return TASK_COMPLETE
            }
        }
        const ret = perform_callback(creep,fb.collect[0])
        if(ret != TASK_DOING) fb.collect.shift()
        return TASK_DOING
    }
    if(fb.state == 'consume'){
        if(!fb.consume.length) {
            change_flow(fb)
            if(!fb.consume.length) {
                fb.state = 'collect'
                return TASK_COMPLETE
            }
        }
        const ret = perform_callback(creep,fb.consume[0])
        if(ret != TASK_DOING) fb.consume.shift()
        return TASK_DOING
    }
    return TASK_FAILED
}

const change_flow = function(fb:WorkerMemory) {
    const pool = Memory.rooms[fb.fromRoom]._dynamic
    const flow = work_priority[fb.priority]
    if(fb.state == 'collect'){
        for(let source of flow[0]){
            if(!pool[source]?.length)
                pool[source] = posed_task_updater[source](Game.rooms[fb.fromRoom])
            const tasks = pool[source]
            if(tasks && tasks.length) {
                tasks.shift()
                fb.collect.push(parse_posed_task(tasks[0]))
                return
            }
        }
    }
    if(fb.state == 'consume'){
        for(let source of flow[1]){
            if(!pool[source]?.length)
                pool[source] = posed_task_updater[source](Game.rooms[fb.fromRoom])
            const tasks = pool[source]
            if(tasks && tasks.length) {
                tasks.shift()
                fb.consume.push(parse_posed_task(tasks[0]))
                return
            }
        }
    }
}

const parse_posed_task = function(posed:PosedCreepTask<TargetedAction>):CallbackBehavior<AnyAction>{
    const root: CallbackBehavior<TargetedAction> = {...{bhvr_name:'callbackful'},...posed}
    const move: CallbackBehavior<'approach'> = {...{bhvr_name:'callbackful'},
            ...{action:"approach",args:[posed.pos,1]}}
    const full: CallbackBehavior<'prejudge_full'> = {...{bhvr_name:'callbackful'},
            ...{action:"prejudge_full",args:[0]}}

    switch(root.action){
        case 'withdraw':
        case 'transfer':
        case 'pickup':
            root[OK] = TASK_COMPLETE
            break
        case 'harvest':
        case 'dismantle':
            root[OK] = full
            break
        default: throw new Error("Unexpected state.")
    }
    root[ERR_NOT_IN_RANGE] = move
    return root
}