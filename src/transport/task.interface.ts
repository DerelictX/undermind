
type Looper = {
    reload_time:    number
    interval:       number
}

type TaskUpdater<T extends {[P in keyof T]: CachedRoomTasks<PrimitiveAction>}> = {
    [P in keyof T]: (tasks:T[P],room:Room) => void
}

type CachedRoomTasks<T extends PrimitiveAction> =
    Looper & ({pos: RoomPosition} & ActionDescript<T>)[]

interface ProduceController {
    source:     CachedRoomTasks<'harvest'>
    mineral:    CachedRoomTasks<'harvest'>
    deposit:    CachedRoomTasks<'harvest'>
    recycle:    CachedRoomTasks<'dismantle'>
}

interface CollectController {
    harvested:  CachedRoomTasks<'withdraw'>
    loot:       CachedRoomTasks<'withdraw'>
    sweep:      CachedRoomTasks<'withdraw'>
    compound:   CachedRoomTasks<'withdraw'>
}

interface ConsumeController {
    build:      CachedRoomTasks<'build'>
    repair:     CachedRoomTasks<'repair'>
    decayed:    CachedRoomTasks<'repair'>
    fortify:    CachedRoomTasks<'repair'>
    anti_nuke:  CachedRoomTasks<'repair'>
    upgrade:    CachedRoomTasks<'upgradeController'>
    downgraded: CachedRoomTasks<'upgradeController'>
}

interface SupplyController {
    extension:  CachedRoomTasks<'transfer'>
    tower:      CachedRoomTasks<'transfer'>
    boost:      CachedRoomTasks<'transfer'>
    reactant:   CachedRoomTasks<'transfer'>
    pwr_spawn:  CachedRoomTasks<'transfer'>
    safe_mode:  CachedRoomTasks<'generateSafeMode'>
}