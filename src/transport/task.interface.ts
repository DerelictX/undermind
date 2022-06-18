
type Looper = {
    reload_time:    number
    interval:       number
}

type TaskUpdater<T extends {[P in keyof T]: CachedRoomTasks<PrimitiveAction>}> = {
    [P in keyof T]: (tasks:T[P],room:Room) => void
}

type CachedRoomTasks<T extends PrimitiveAction> =
    ({pos: RoomPosition} & ActionDescript<T>)[]

interface CollectController {
    source:     CachedRoomTasks<'harvest'>
    mineral:    CachedRoomTasks<'harvest'>
    deposit:    CachedRoomTasks<'harvest'>
    recycle:    CachedRoomTasks<'dismantle'>
    harvested:  CachedRoomTasks<'withdraw'>
    loot:       CachedRoomTasks<'withdraw'>
    sweep:      CachedRoomTasks<'withdraw'>
    compound:   CachedRoomTasks<'withdraw'>
}

//consume energy
interface ConsumeController {
    build:      CachedRoomTasks<'build'>
    repair:     CachedRoomTasks<'repair'>
    decayed:    CachedRoomTasks<'repair'>
    fortify:    CachedRoomTasks<'repair'>
    anti_nuke:  CachedRoomTasks<'repair'>
    upgrade:    CachedRoomTasks<'upgradeController'>
    downgraded: CachedRoomTasks<'upgradeController'>
    extension:  CachedRoomTasks<'transfer'>
    tower:      CachedRoomTasks<'transfer'>
}

interface SupplyController {
    boost:      CachedRoomTasks<'transfer'>
    reactant:   CachedRoomTasks<'transfer'>
    pwr_spawn:  CachedRoomTasks<'transfer'>
    safe_mode:  CachedRoomTasks<'generateSafeMode'>
}

interface StaticController {
    source:     StaticBehavior[]
    mineral:    StaticBehavior[]
    upgrade:    StaticBehavior[]
    reserve:    CachedRoomTasks<ClaimAction>
    siege:      CachedRoomTasks<'dismantle'>
}
