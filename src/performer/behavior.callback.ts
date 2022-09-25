import { perform_primitive } from "./action.primitive";
import { perform_virtual } from "./action.virtual";

export const TASK_DOING:       TASK_DOING      = -16
export const TASK_COMPLETE:    TASK_COMPLETE   = -17
export const TASK_FAILED:      TASK_FAILED     = -18

export const perform_callback = function(creep:Creep, behavior:CallbackBehavior<AnyAction>): TaskReturnCode {
    let ret: ScreepsReturnCode
    let callback: CallbackBehavior<AnyAction> | TaskReturnCode | undefined = behavior
    do{
        switch(callback.action){
            case 'approach':
            case 'escape':
            case 'hold_place':
            case 'prejudge_empty':
            case 'prejudge_full':
            case 'full_hits':
                ret = perform_virtual(creep,callback); break;
            default: ret = perform_primitive(creep,callback)
        }
        callback = callback[ret]
        if(callback == TASK_DOING || callback == TASK_COMPLETE || callback == TASK_FAILED)
            return callback
    }while(callback)
    return ret ? TASK_FAILED : TASK_DOING
}

/**
 * 将缓存的任务，解析为能被perform_callback执行的格式，加上一些条件判断
 * @param posed 
 * @returns 
 */
 export const parse_posed_task = function(posed:PosedCreepTask<TargetedAction>):CallbackBehavior<AnyAction>{
    const main: CallbackBehavior<TargetedAction> = {...{bhvr_name:'callbackful'},...posed}
    const move: CallbackBehavior<'approach'> = {...{bhvr_name:'callbackful'},
            ...{action:"approach",args:[posed.pos,1]}}
    main[ERR_NOT_IN_RANGE] = move
    switch(main.action){
        case 'withdraw':
        case 'transfer':
        case 'pickup':
        case 'generateSafeMode':
            main[OK] = TASK_COMPLETE
        default: return main
    }
}