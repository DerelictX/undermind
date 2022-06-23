import { perform_any, TASK_COMPLETE, TASK_DOING, TASK_FAILED } from "./behavior.any"

export const combo_performer: {
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