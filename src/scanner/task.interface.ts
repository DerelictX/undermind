
type TaskUpdater<T extends {[P in keyof T]: PosedCreepTask<TargetedAction>[]}> = {
    [P in keyof T]: (room:Room) => T[P]
}

type ResFlow = [
    from:   keyof CollectTaskPool,
    to:     keyof ConsumeTaskPool]
| [ from:   keyof CollectTaskPool | 'lazy',
    to:     keyof ConsumeTaskPool]
| [ from:   keyof CollectTaskPool,
    to:     keyof ConsumeTaskPool | 'lazy']

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
    R_src0:     PosedCreepTask<'repair'>[]
    R_src1:     PosedCreepTask<'repair'>[]
    R_src2:     PosedCreepTask<'repair'>[]

    build:      PosedCreepTask<'build'>[]
    fortify:    PosedCreepTask<'repair'>[]
    decayed:    PosedCreepTask<'repair'>[]
    U_ctrl:     PosedCreepTask<'upgradeController'>[]
    
    repair:     PosedCreepTask<'repair'>[]
    anti_nuke:  PosedCreepTask<'repair'>[]
    downgraded: PosedCreepTask<'upgradeController'>[]
}

interface SupplyTaskPool {
    T_ext:      PosedCreepTask<'transfer'>[]
    T_tower:    PosedCreepTask<'transfer'>[]
    T_ctrl:     PosedCreepTask<'transfer'>[]
    
    T_src0:     PosedCreepTask<'transfer'>[]
    T_src1:     PosedCreepTask<'transfer'>[]
    T_src2:     PosedCreepTask<'transfer'>[]
    T_mnrl:     PosedCreepTask<'transfer'>[]

    T_boost:    PosedCreepTask<'transfer'>[]
    T_react:    PosedCreepTask<'transfer'>[]
    T_power:    PosedCreepTask<'transfer'>[]
    
    gen_safe:   PosedCreepTask<'generateSafeMode'>[]
}

interface StaticTaskPool {
    H_srcs:     PosedCreepTask<'harvest'>[]
    T_src0:     PosedCreepTask<'transfer'>[]
    T_src1:     PosedCreepTask<'transfer'>[]
    T_src2:     PosedCreepTask<'transfer'>[]
    W_srcs:     PosedCreepTask<'withdraw'>[]

    H_mnrl:     PosedCreepTask<'harvest'>[]
    T_mnrl:     PosedCreepTask<'transfer'>[]
    W_mnrl:     PosedCreepTask<'withdraw'>[]

    W_ctrl:     PosedCreepTask<'withdraw'>[]
    U_ctrl:     PosedCreepTask<'upgradeController'>[]
    
    R_ctrl:     PosedCreepTask<'reserveController'>[]
    A_ctrl:     PosedCreepTask<'attackController'>[]
    A_core:     PosedCreepTask<'attack'>[]
}
