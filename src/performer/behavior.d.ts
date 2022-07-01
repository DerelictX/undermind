type AnyBehavior =
    |ComboBehavior
    |FlowBehavior
    |CallbackBehavior<AnyAction>

type TaskReturnCode = TASK_DOING|TASK_COMPLETE|TASK_FAILED
type TASK_DOING     = -16
type TASK_COMPLETE  = -17
type TASK_FAILED    = -18

type ComboBehavior = {
    bhvr_name: "serial"|"parallel"|"backtrack"
    sub_tasks: AnyBehavior[]
}

interface FlowBehavior {
    bhvr_name:  "flow"
    
    state:      "collect"|"consume"|"idle"
    collect:    CallbackBehavior<AnyAction>[]
    consume:    CallbackBehavior<AnyAction>[]
    current:    ResFlow

    fromRoom:   string
    toRoom:     string
    priority:   CarrierRole
}

type CallbackBehavior<T extends AnyAction> = T extends AnyAction ? {
    [R in ScreepsReturnCode] ?: CallbackBehavior<AnyAction> | TaskReturnCode
} & {bhvr_name: "callbackful"} & AnyDescript<T> : never