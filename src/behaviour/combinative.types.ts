
type ApproachBehavior = {
    bhvr_name: "approach"|"flee"
    args: Parameters<RoomPosition['inRangeTo']>
}
type SerialBehavior = {
    bhvr_name: "serial"
    sub_tasks: AnyBehavior[]
}
type ParallelBehavior = {
    bhvr_name: "parallel"
    sub_tasks: AnyBehavior[]
}
type BranchBehavior = {
    bhvr_name:  "branch"
    listened:   AnyBehavior
    callbacks:  {[ret in ScreepsReturnCode]?:AnyBehavior|undefined}
}

type AnyBehavior = ActionDescript<PrimitiveAction>
    |ApproachBehavior
    |CombinativeBehavior

type CombinativeBehavior = SerialBehavior|ParallelBehavior|BranchBehavior

type TaskReturnCode = ScreepsReturnCode|TASK_DOING|TASK_COMPLETE|TASK_FAILED
type TASK_DOING     = -16
type TASK_COMPLETE  = -17
type TASK_FAILED    = -18