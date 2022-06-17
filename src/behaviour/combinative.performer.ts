import { perform_virtual } from "@/action/performer.virtual"
import { perform_primitive } from "@/action/primitive.performer"

const TASK_DOING:       TASK_DOING      = -16
const TASK_COMPLETE:    TASK_COMPLETE   = -17
const TASK_FAILED:      TASK_FAILED     = -18

export const perform_any = function(creep:Creep, behavior:AnyBehavior):TaskReturnCode {
    switch(behavior.bhvr_name){
        case 'serial':
        case 'parallel':
        case 'backtrack':
            return combo_performer[behavior.bhvr_name](creep,behavior.sub_tasks)
        default:
            return perform_callbackful(creep,behavior)
    }
}

const perform_callbackful = function(creep:Creep, behavior:CallbackfulBehavior<AnyAction>): TaskReturnCode {
    let ret: ScreepsReturnCode
    let callback: CallbackfulBehavior<AnyAction> | TaskReturnCode | undefined = behavior
    do{
        switch(callback.action){
            case 'approach':
            case 'prejudge_empty':
            case 'prejudge_full':
                ret = perform_virtual(creep,callback); break;
            default: ret = perform_primitive(creep,callback)
        }
        callback = callback[ret]
        if(callback == TASK_DOING || callback == TASK_COMPLETE || callback == TASK_FAILED)
            return callback
    }while(callback)
    if(ret) creep.say('ERR' + ret)
    return ret ? TASK_FAILED : TASK_DOING
}

const combo_performer: {
    [k in ComboBehavior["bhvr_name"]]:(creep: Creep, sub_tasks: AnyBehavior[]) => TaskReturnCode
} = {
    serial: function (creep: Creep, sub_tasks: AnyBehavior[]) {
        const task = sub_tasks[0]
        if (!task)
            return TASK_COMPLETE
        const ret = perform_any(creep, task)
        if (ret == TASK_COMPLETE) {
            sub_tasks.shift()
            if (sub_tasks.length == 0)
                return TASK_COMPLETE
        }
        return ret
    },
    parallel: function (creep: Creep, sub_tasks: AnyBehavior[]) {
        for (let task of sub_tasks) {
            const ret = perform_any(creep, task)
        }
        return TASK_DOING
    },
    backtrack: function (creep: Creep, sub_tasks: AnyBehavior[]): TaskReturnCode {
        for (let task of sub_tasks) {
            const ret = perform_any(creep, task)
            if(ret == TASK_FAILED) continue
            return ret
        }
        return TASK_FAILED
    }
}