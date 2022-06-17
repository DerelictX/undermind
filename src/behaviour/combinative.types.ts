type AnyBehavior =
    |CallbackfulBehavior<AnyAction>
    |ComboBehavior

type TaskReturnCode = TASK_DOING|TASK_COMPLETE|TASK_FAILED
type TASK_DOING     = -16
type TASK_COMPLETE  = -17
type TASK_FAILED    = -18

type ComboBehavior = {
    bhvr_name: "serial"|"parallel"|"backtrack"
    sub_tasks: AnyBehavior[]
}

type CallbackfulBehavior<T extends AnyAction> = T extends AnyAction ? {
    [R in ScreepsReturnCode] ?: CallbackfulBehavior<AnyAction> | TaskReturnCode
} & {bhvr_name: "callbackful"} & ActionDescript<T> : never
