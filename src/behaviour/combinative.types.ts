type CombinativeBehaviorName = "serial"|"parallel"
type CombinativeBehavior = SerialBehavior|ParallelBehavior

type SerialBehavior = {
    bhvr_name: "serial"
    sub_tasks: AnyBehavior[]
}
type ParallelBehavior = {
    bhvr_name: "parallel"
    sub_tasks: AnyBehavior[]
}

type AnyBehavior = SynchronousBehavior|CombinativeBehavior
type TaskReturnCode = TASK_DOING|TASK_COMPLETE|TASK_FAILED
type TASK_DOING     = -16
type TASK_COMPLETE  = -17
type TASK_FAILED    = -18