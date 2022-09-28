import { perform_callback, TASK_DOING } from "@/performer/behavior.callback"

export const run_static = function(creep:Creep,fb:StaticMemory){
    if(fb.state == 'collect'){
        for(let task of fb.collect){
            const ret = perform_callback(creep,task)
            if(ret == TASK_DOING) return
            if(creep.store.getFreeCapacity() == 0){
                fb.state = 'consume'
            }
        }
    }
    else if(fb.state == 'consume'){
        for(let task of fb.consume){
            const ret = perform_callback(creep,task)
            if(ret == TASK_DOING) return
            if(creep.store.getUsedCapacity() == 0){
                fb.state = 'collect'
            }
        }
    }
}