import { perform_callback } from "./behavior.callback"
import { combo_performer} from "./behavior.combo"

export const TASK_DOING:       TASK_DOING      = -16
export const TASK_COMPLETE:    TASK_COMPLETE   = -17
export const TASK_FAILED:      TASK_FAILED     = -18

export const perform_any = function(creep:Creep, behavior:AnyBehavior):TaskReturnCode {
    switch(behavior.bhvr_name){
        case 'serial':
        case 'parallel':
        case 'backtrack':
            return combo_performer[behavior.bhvr_name](creep,behavior.sub_tasks)
        default:
            return perform_callback(creep,behavior)
    }
}