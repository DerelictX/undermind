const TASK_DOING:       TASK_DOING      = -16
const TASK_COMPLETE:    TASK_COMPLETE   = -17
const TASK_FAILED:      TASK_FAILED     = -18

const combo_performer = {
    serial: function(creep: Creep, behavior:SerialBehavior) {
        const task = behavior.sub_tasks[0]
        if(!task) return TASK_COMPLETE
        const ret = perform_any(creep,task)
        if(ret == TASK_COMPLETE){
            behavior.sub_tasks.shift()
            if(behavior.sub_tasks.length == 0)
                return TASK_COMPLETE
        }
        return ret
    },
    parallel: function(creep: Creep, behavior:ParallelBehavior) {
        for(let task of behavior.sub_tasks){
            const ret = perform_any(creep,task)
        }
        return TASK_DOING
    },
}

const perform_any = function(creep:Creep, behavior:AnyBehavior):TaskReturnCode {
    switch(behavior.bhvr_name){
        case 'serial':
            return combo_performer[behavior.bhvr_name](creep,behavior)
        case 'parallel':
            return combo_performer[behavior.bhvr_name](creep,behavior)
        default:
            return perform_primitive(creep,behavior)
    }
}
