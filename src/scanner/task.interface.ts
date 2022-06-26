
type TaskUpdater<T extends {[P in keyof T]: PosedCreepTasks<TargetedAction>}> = {
    [P in keyof T]: (room:Room) => T[P]
}

type CachedPool<T extends {[P in keyof T]: PosedCreepTasks<TargetedAction>}> =
    T extends {[P in keyof T]: PosedCreepTasks<CollectAction&TargetedAction>}
            ? {[P in keyof T]: PosedCreepTasks<CollectAction&TargetedAction>} :
    T extends {[P in keyof T]: PosedCreepTasks<ConsumeAction&TargetedAction>}
            ? {[P in keyof T]: PosedCreepTasks<ConsumeAction&TargetedAction>} :
    {[P in keyof T]: PosedCreepTasks<TargetedAction>}

type ResFlow = [
    from:   keyof CollectTaskPool,
    to:     keyof ConsumeTaskPool]
| [ from:   'lazy' | keyof CollectTaskPool,
    to:     keyof ConsumeTaskPool]
| [ from:   keyof CollectTaskPool,
    to:     'lazy' | keyof ConsumeTaskPool]

type PosedCreepTasks<T extends TargetedAction> =
    ({pos: RoomPosition} & ActionDescript<T>)[]

interface CollectTaskPool {
    H_src0:     PosedCreepTasks<'harvest'>
    H_src1:     PosedCreepTasks<'harvest'>
    H_src2:     PosedCreepTasks<'harvest'>
    H_mnrl:     PosedCreepTasks<'harvest'>

    H_srcs:     PosedCreepTasks<'harvest'>
    deposit:    PosedCreepTasks<'harvest'>
    recycle:    PosedCreepTasks<'dismantle'>
    
    W_srcs:     PosedCreepTasks<'withdraw'>
    W_mnrl:     PosedCreepTasks<'withdraw'>
    W_ctrl:     PosedCreepTasks<'withdraw'>
    
    loot:       PosedCreepTasks<'withdraw'>
    sweep:      PosedCreepTasks<'withdraw'|'pickup'>
    compound:   PosedCreepTasks<'withdraw'>
}

interface ConsumeTaskPool {
    T_src0:     PosedCreepTasks<'transfer'|'repair'>
    T_src1:     PosedCreepTasks<'transfer'|'repair'>
    T_src2:     PosedCreepTasks<'transfer'|'repair'>
    T_mnrl:     PosedCreepTasks<'transfer'>

    build:      PosedCreepTasks<'build'>
    fortify:    PosedCreepTasks<'repair'>
    decayed:    PosedCreepTasks<'repair'>
    U_ctrl:     PosedCreepTasks<'upgradeController'>
    
    repair:     PosedCreepTasks<'repair'>
    anti_nuke:  PosedCreepTasks<'repair'>
    downgraded: PosedCreepTasks<'upgradeController'>
    gen_safe:   PosedCreepTasks<'generateSafeMode'>

    T_ext:      PosedCreepTasks<'transfer'>
    T_tower:    PosedCreepTasks<'transfer'>
    T_ctrl:     PosedCreepTasks<'transfer'>

    T_boost:    PosedCreepTasks<'transfer'>
    T_react:    PosedCreepTasks<'transfer'>
    T_power:    PosedCreepTasks<'transfer'>
}

interface StaticTaskPool {
    reserve:    PosedCreepTasks<'reserveController'>
    siege:      PosedCreepTasks<'dismantle'>
}
