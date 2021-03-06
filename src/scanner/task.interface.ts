
type TaskUpdater<T extends {[P in keyof T]: Posed<PrimitiveDescript<TargetedAction>>[]}> = {
    [P in keyof T]: (room:Room) => T[P]
}

type Posed<T extends PrimitiveDescript<TargetedAction>> = {pos: RoomPosition} & T

type PosedCreepTask<T extends TargetedAction> =
    Posed<PrimitiveDescript<T>>

type FilterPoolKey<T extends WorkAction|CarryAction, R extends ResourceConstant> =
    ValueTypes<{[K in keyof DynamicTaskPool]: 
        DynamicTaskPool[K] extends RestrictedPrimitiveDescript<T,R>[] ? K : never}>

interface DynamicTaskPool {
    //sources
    H_src0:     Posed<RestrictedPrimitiveDescript<'harvest','energy'>>[]
    H_src1:     Posed<RestrictedPrimitiveDescript<'harvest','energy'>>[]
    H_src2:     Posed<RestrictedPrimitiveDescript<'harvest','energy'>>[]
    T_src0:     Posed<RestrictedPrimitiveDescript<'transfer'|'repair','energy'>>[]
    T_src1:     Posed<RestrictedPrimitiveDescript<'transfer'|'repair','energy'>>[]
    T_src2:     Posed<RestrictedPrimitiveDescript<'transfer'|'repair','energy'>>[]
    //mineral
    H_mnrl:     Posed<RestrictedPrimitiveDescript<'harvest',MineralConstant>>[]
    T_mnrl:     Posed<RestrictedPrimitiveDescript<'transfer',MineralConstant>>[]
    deposit:    Posed<RestrictedPrimitiveDescript<'harvest',DepositConstant>>[]
    //controller
    W_ctrl:     Posed<RestrictedPrimitiveDescript<'withdraw','energy'>>[]
    U_ctrl:     Posed<PrimitiveDescript<'upgradeController'>>[]
    //get energy
    H_srcs:     Posed<RestrictedPrimitiveDescript<'harvest','energy'>>[]
    recycle:    Posed<PrimitiveDescript<'dismantle'>>[]
    W_energy:   Posed<RestrictedPrimitiveDescript<'withdraw','energy'>>[]
    //consume energy
    build:      Posed<PrimitiveDescript<'build'>>[]
    fortify:    Posed<PrimitiveDescript<'repair'>>[]
    decayed:    Posed<PrimitiveDescript<'repair'>>[]
    repair:     Posed<PrimitiveDescript<'repair'>>[]
    anti_nuke:  Posed<PrimitiveDescript<'repair'>>[]
    downgraded: Posed<PrimitiveDescript<'upgradeController'>>[]
    T_ext:      Posed<RestrictedPrimitiveDescript<'transfer','energy'>>[]
    T_tower:    Posed<RestrictedPrimitiveDescript<'transfer','energy'>>[]
    T_cntn:     Posed<RestrictedPrimitiveDescript<'transfer','energy'>>[]
    //collect
    W_cntn:     Posed<PrimitiveDescript<'withdraw'>>[]
    loot:       Posed<PrimitiveDescript<'withdraw'>>[]
    sweep:      Posed<PrimitiveDescript<'withdraw'|'pickup'>>[]
    compound:   Posed<PrimitiveDescript<'withdraw'>>[]
    //supply
    T_boost:    Posed<PrimitiveDescript<'transfer'>>[]
    T_react:    Posed<PrimitiveDescript<'transfer'>>[]
    T_power:    Posed<PrimitiveDescript<'transfer'>>[]
    T_nuker:    Posed<PrimitiveDescript<'transfer'>>[]
    gen_safe:   Posed<PrimitiveDescript<'generateSafeMode'>>[]
}

interface StaticTaskPool {
    H_srcs:     Posed<RestrictedPrimitiveDescript<'harvest','energy'>>[]
    T_src0:     Posed<RestrictedPrimitiveDescript<'transfer'|'repair','energy'>>[]
    T_src1:     Posed<RestrictedPrimitiveDescript<'transfer'|'repair','energy'>>[]
    T_src2:     Posed<RestrictedPrimitiveDescript<'transfer'|'repair','energy'>>[]

    H_mnrl:     Posed<RestrictedPrimitiveDescript<'harvest',MineralConstant>>[]
    T_mnrl:     Posed<RestrictedPrimitiveDescript<'transfer',MineralConstant>>[]

    W_ctrl:     Posed<RestrictedPrimitiveDescript<'withdraw','energy'>>[]
    U_ctrl:     Posed<PrimitiveDescript<'upgradeController'>>[]
    
    R_ctrl:     Posed<PrimitiveDescript<'reserveController'>>[]
    A_ctrl:     Posed<PrimitiveDescript<'attackController'>>[]
    A_core:     Posed<PrimitiveDescript<'attack'>>[]
}

type EnSource = FilterPoolKey<(WorkAction|CarryAction)&CollectAction,'energy'>
type EnSink =   FilterPoolKey<(WorkAction|CarryAction)&ConsumeAction,'energy'>
type ResFlow = [
    from:   FilterPoolKey<CarryAction&CollectAction,ResourceConstant>|'storage',
    to:     FilterPoolKey<CarryAction&ConsumeAction,ResourceConstant>|'storage']