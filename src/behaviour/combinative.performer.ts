const TASK_DOING:       TASK_DOING      = -16
const TASK_COMPLETE:    TASK_COMPLETE   = -17
const TASK_FAILED:      TASK_FAILED     = -18

const combo_performer = {
    approach: function(creep: Creep, behavior:ApproachBehavior) {
        if(creep.pos.inRangeTo(behavior.args[0],behavior.args[1]))
            return TASK_COMPLETE
        if(creep.moveTo(behavior.args[0]) == OK)
            return TASK_DOING
        return TASK_FAILED
    },
    serial: function(creep: Creep, behavior:SerialBehavior) {
        const task = behavior.sub_tasks[0]
        if(!task) return
    },
    parallel: function(creep: Creep, behavior:ParallelBehavior) {
        if(creep.pos.inRangeTo(behavior.args[0],behavior.args[1]))
            return TASK_COMPLETE
        if(creep.moveTo(behavior.args[0]) == OK)
            return TASK_DOING
        return TASK_FAILED
    },
    serial: function(creep: Creep, behavior:ApproachBehavior) {
        if(creep.pos.inRangeTo(behavior.args[0],behavior.args[1]))
            return TASK_COMPLETE
        if(creep.moveTo(behavior.args[0]) == OK)
            return TASK_DOING
        return TASK_FAILED
    },
    serial: function(creep: Creep, behavior:ApproachBehavior) {
        if(creep.pos.inRangeTo(behavior.args[0],behavior.args[1]))
            return TASK_COMPLETE
        if(creep.moveTo(behavior.args[0]) == OK)
            return TASK_DOING
        return TASK_FAILED
    },
}

const perform_any = function(creep:Creep, behavior:AnyBehavior):TaskReturnCode {
    switch(behavior.bhvr_name){
        case 'serial':
            return combo_performer[behavior.bhvr_name](creep,behavior)
        case 'parallel':
            return combo_performer[behavior.bhvr_name](creep,behavior)
        case 'switch':
            return combo_performer[behavior.bhvr_name](creep,behavior)
        case 'approach':
            return combo_performer[behavior.bhvr_name](creep,behavior)
        case 'flee':
            return combo_performer[behavior.bhvr_name](creep,behavior)
        default:
            if(perform_primitive(creep,behavior) == OK)
                return TASK_DOING
            return TASK_FAILED
    }
}
