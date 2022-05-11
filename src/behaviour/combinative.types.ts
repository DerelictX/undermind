type AnyBehavior =
    |CallbackfulBehavior<AnyAction>
    |SerialBehavior|ParallelBehavior

type TaskReturnCode = TASK_DOING|TASK_COMPLETE|TASK_FAILED
type TASK_DOING     = -16
type TASK_COMPLETE  = -17
type TASK_FAILED    = -18

/****************************************************************************************/

type CallbackfulBehavior<T extends AnyAction> = T extends AnyAction ? {
    [R in ScreepsReturnCode] ?: CallbackfulBehavior<AnyAction> | TaskReturnCode
} & {bhvr_name: "callbackful"} & ActionDescript<T> : never

type SerialBehavior = {
    bhvr_name: "serial"
    sub_tasks: AnyBehavior[]
}
type ParallelBehavior = {
    bhvr_name: "parallel"
    sub_tasks: AnyBehavior[]
}
