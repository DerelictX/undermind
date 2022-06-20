
type TaskUpdater<T extends {[P in keyof T]: CachedRoomTasks<PrimitiveAction> | StaticBehavior[]}> = {
    [P in keyof T]: (room:Room) => T[P]
}

type CachedRoomTasks<T extends PrimitiveAction> =
    ({pos: RoomPosition} & ActionDescript<T>)[]

interface CollectController {
    autarky:    CachedRoomTasks<'harvest'>
    mining:     CachedRoomTasks<'harvest'>
    deposit:    CachedRoomTasks<'harvest'>
    recycle:    CachedRoomTasks<'dismantle'>
    harvested:  CachedRoomTasks<'withdraw'>
    loot:       CachedRoomTasks<'withdraw'>
    sweep:      CachedRoomTasks<'withdraw'|'pickup'>
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
    buffer:     CachedRoomTasks<'transfer'>
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
