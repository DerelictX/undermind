import { perform_primitive } from "./action.primitive";
import { perform_virtual } from "./action.virtual";
import { TASK_COMPLETE, TASK_DOING, TASK_FAILED } from "./behavior.any";

export const perform_callback = function(creep:Creep, behavior:CallbackBehavior<AnyAction>): TaskReturnCode {
    let ret: ScreepsReturnCode
    let callback: CallbackBehavior<AnyAction> | TaskReturnCode | undefined = behavior
    do{
        switch(callback.action){
            case 'approach':
            case 'escape':
            case 'prejudge_empty':
            case 'prejudge_full':
                ret = perform_virtual(creep,callback); break;
            default: ret = perform_primitive(creep,callback)
        }
        console.log(callback.action + ret)
        callback = callback[ret]
        if(callback == TASK_DOING || callback == TASK_COMPLETE || callback == TASK_FAILED)
            return callback
    }while(callback)
    return ret ? TASK_FAILED : TASK_DOING
}
