type TaskReturnCode = TASK_DOING | TASK_COMPLETE | TASK_FAILED
type TASK_DOING = -16
type TASK_COMPLETE = -17
type TASK_FAILED = -18

type CallbackBehavior<T extends PrimitiveAction> = T extends PrimitiveAction ? {
    [R in ScreepsReturnCode]?: CallbackBehavior<PrimitiveAction> | TaskReturnCode
} & PosedCreepTask<T> : never

type PosedCreepTask<T extends PrimitiveAction> = T extends PrimitiveAction ? {
    action: T extends PrimitiveAction ? T : never
    args: CachedArgs<Parameters<Creep[T]>>
    pos: RoomPosition
} : never