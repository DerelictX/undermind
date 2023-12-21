import {approach} from "@/move/action.virtual";
import {perform_primitive} from "./action.primitive";

export const TASK_DOING: TASK_DOING = -16
export const TASK_COMPLETE: TASK_COMPLETE = -17
export const TASK_FAILED: TASK_FAILED = -18

export const perform_callback = function (creep: Creep, behavior: CallbackBehavior<PrimitiveAction>): TaskReturnCode {
    let ret: ScreepsReturnCode
    let callback: CallbackBehavior<PrimitiveAction> | TaskReturnCode | undefined = behavior
    do {
        ret = perform_primitive(creep, callback.action, callback.args)
        approach(creep, callback.pos, action_range[callback.action])
        callback = callback[ret]
        if (callback == TASK_DOING || callback == TASK_COMPLETE || callback == TASK_FAILED)
            return callback
    } while (callback)
    if (ret) creep.say('' + ret)
    return ret ? TASK_FAILED : TASK_DOING
}

/**
 * 将缓存的任务，解析为能被perform_callback执行的格式，加上一些条件判断
 * @param posed
 * @returns
 */
export const parse_posed_task = function (posed: PosedCreepTask<PrimitiveAction>): CallbackBehavior<PrimitiveAction> {
    const main: CallbackBehavior<PrimitiveAction> = {...posed}
    switch (main.action) {
        case 'withdraw':
        case 'transfer':
        case 'pickup':
        case 'generateSafeMode':
            main[OK] = TASK_COMPLETE
            break
        case 'harvest':
            main[ERR_TIRED] = TASK_DOING
            break
    }
    main[ERR_NOT_IN_RANGE] = TASK_DOING
    return main
}

export const action_range: { [A in PrimitiveAction]: number } = {
    harvest: 1,
    dismantle: 1,
    build: 3,
    repair: 3,
    upgradeController: 3,

    withdraw: 1,
    transfer: 1,
    pickup: 1,

    generateSafeMode: 1,
    attackController: 1,
    reserveController: 1,
    claimController: 1,

    attack: 1,
    rangedAttack: 3,
    heal: 1,
    rangedHeal: 3,

    drop: 0,
    rangedMassAttack: 0
}