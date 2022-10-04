import { perform_callback, TASK_COMPLETE, TASK_DOING, TASK_FAILED } from "@/performer/behavior.callback"

export const run_static = function(creep:Creep,fb:StaticMemory){
    if(fb.state == 'collect'){
        if(run_static_collect(creep,fb) == TASK_COMPLETE)
            run_static_consume(creep,fb)
    }
    else if(fb.state == 'consume'){
        if(run_static_consume(creep,fb) == TASK_COMPLETE)
            run_static_collect(creep,fb)
    }
}

function run_static_collect(creep: Creep, fb: StaticMemory) {
    for(let task of fb.collect){
        const ret = perform_callback(creep,task)
        if(ret == TASK_DOING) return TASK_DOING
        if(creep.store.getFreeCapacity() == 0){
            fb.state = 'consume'
            return TASK_COMPLETE
        }
    }
    return TASK_FAILED
}
function run_static_consume(creep: Creep, fb: StaticMemory) {
    for(let task of fb.consume){
        const ret = perform_callback(creep,task)
        if(ret == TASK_DOING) return TASK_DOING
        if(creep.store.getUsedCapacity() == 0){
            fb.state = 'collect'
            return TASK_COMPLETE
        }
    }
    return TASK_FAILED
}