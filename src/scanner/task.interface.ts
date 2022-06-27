
type TaskUpdater<T extends {[P in keyof T]: PosedCreepTask<TargetedAction>}> = {
    [P in keyof T]: (room:Room) => T[P]
}

type CachedPool<T extends {[P in keyof T]: PosedCreepTask<TargetedAction>[]}> =
    T extends {[P in keyof T]: PosedCreepTask<CollectAction&TargetedAction>[]}
            ? {[P in keyof T]: PosedCreepTask<CollectAction&TargetedAction>[]} :
    T extends {[P in keyof T]: PosedCreepTask<ConsumeAction&TargetedAction>[]}
            ? {[P in keyof T]: PosedCreepTask<ConsumeAction&TargetedAction>[]} :
    {[P in keyof T]: PosedCreepTask<TargetedAction>[]}

type ResFlow = [
    from:   keyof CollectTaskPool,
    to:     keyof ConsumeTaskPool]
| [ from:   'lazy' | keyof CollectTaskPool,
    to:     keyof ConsumeTaskPool]
| [ from:   keyof CollectTaskPool,
    to:     'lazy' | keyof ConsumeTaskPool]

type PosedCreepTask<T extends TargetedAction> =
    {pos: RoomPosition} & ActionDescript<T>

interface CollectTaskPool {
    H_src0:     PosedCreepTask<'harvest'>[]
    H_src1:     PosedCreepTask<'harvest'>[]
    H_src2:     PosedCreepTask<'harvest'>[]
    H_mnrl:     PosedCreepTask<'harvest'>[]

    H_srcs:     PosedCreepTask<'harvest'>[]
    deposit:    PosedCreepTask<'harvest'>[]
    recycle:    PosedCreepTask<'dismantle'>[]
    
    W_srcs:     PosedCreepTask<'withdraw'>[]
    W_mnrl:     PosedCreepTask<'withdraw'>[]
    W_ctrl:     PosedCreepTask<'withdraw'>[]
    
    loot:       PosedCreepTask<'withdraw'>[]
    sweep:      PosedCreepTask<'withdraw'|'pickup'>[]
    compound:   PosedCreepTask<'withdraw'>[]
}

interface ConsumeTaskPool {
    T_src0:     PosedCreepTask<'transfer'|'repair'>[]
    T_src1:     PosedCreepTask<'transfer'|'repair'>[]
    T_src2:     PosedCreepTask<'transfer'|'repair'>[]
    T_mnrl:     PosedCreepTask<'transfer'>[]

    build:      PosedCreepTask<'build'>[]
    fortify:    PosedCreepTask<'repair'>[]
    decayed:    PosedCreepTask<'repair'>[]
    U_ctrl:     PosedCreepTask<'upgradeController'>[]
    
    repair:     PosedCreepTask<'repair'>[]
    anti_nuke:  PosedCreepTask<'repair'>[]
    downgraded: PosedCreepTask<'upgradeController'>[]
    gen_safe:   PosedCreepTask<'generateSafeMode'>[]

    T_ext:      PosedCreepTask<'transfer'>[]
    T_tower:    PosedCreepTask<'transfer'>[]
    T_ctrl:     PosedCreepTask<'transfer'>[]

    T_boost:    PosedCreepTask<'transfer'>[]
    T_react:    PosedCreepTask<'transfer'>[]
    T_power:    PosedCreepTask<'transfer'>[]
}

interface StaticTaskPool {
    reserve:    PosedCreepTask<'reserveController'>[]
    siege:      PosedCreepTask<'dismantle'>[]
}
