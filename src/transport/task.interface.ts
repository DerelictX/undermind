type supply_task_name = 'extension'|'tower'|'boost'|'reactant'|'power_spawn'
type collect_task_name = 'harvested'|'loot'|'sweep'|'compound'

interface TransportTask{
    source:         Id<AnyStoreStructure|Tombstone|Ruin>
    target:         Id<AnyCreep|AnyStoreStructure>
    resourceType:   ResourceConstant
    amount:         number
}

interface TransferTask {
    pos:            RoomPosition
    //args:           ActionDescript<'transfer'>
    target:         Id<AnyCreep|AnyStoreStructure>
    resourceType:   ResourceConstant
    amount:         number
}

interface WithdrawTask {
    pos:            RoomPosition
    //args:           ActionDescript<'withdraw'>
    target:         Id<AnyStoreStructure|Tombstone|Ruin>
    resourceType:   ResourceConstant
    amount:         number
}

type Looper = {
    reload_time:    number
    interval:       number
}

type TaskUpdater<T extends {[P in keyof T]: CachedRoomTasks<PrimitiveAction>}> = {
    [P in keyof T]: (tasks:T[P],room:Room) => void
}

type CachedRoomTasks<T extends PrimitiveAction> = Looper & ActionDescript<T>[]

interface ConsumeController {
    repair:     CachedRoomTasks<'repair'>
    maintain:   CachedRoomTasks<'repair'|'upgradeController'>
    anti_nuke:  CachedRoomTasks<'repair'>
    build:      CachedRoomTasks<'build'>
    fortifer:   CachedRoomTasks<'repair'>
}

interface SupplyController {
    extension:  CachedRoomTasks<'transfer'>
    tower:      CachedRoomTasks<'transfer'>
    boost:      CachedRoomTasks<'transfer'>
    reactant:   CachedRoomTasks<'transfer'>
    pwr_spawn:  CachedRoomTasks<'transfer'>
    safe_mode:  CachedRoomTasks<'generateSafeMode'>
}