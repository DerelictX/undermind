type FilterPoolKey<T extends WorkAction|CarryAction, R extends ResourceConstant> =
    ValueTypes<{[K in keyof DynamicTaskPool]: 
        DynamicTaskPool[K] extends RestrictedPrimitiveDescript<T,R>[] ? K : never}>

interface DynamicTaskPool {
    //sources
    H_src0:     RestrictedPrimitiveDescript<'harvest','energy'>[]
    H_src1:     RestrictedPrimitiveDescript<'harvest','energy'>[]
    H_src2:     RestrictedPrimitiveDescript<'harvest','energy'>[]
    T_src0:     RestrictedPrimitiveDescript<'transfer'|'repair'|'build','energy'>[]
    T_src1:     RestrictedPrimitiveDescript<'transfer'|'repair'|'build','energy'>[]
    T_src2:     RestrictedPrimitiveDescript<'transfer'|'repair'|'build','energy'>[]
    //controller
    W_ctrl:     RestrictedPrimitiveDescript<'withdraw','energy'>[]
    U_ctrl:     RestrictedPrimitiveDescript<'upgradeController'>[]
    downgraded: RestrictedPrimitiveDescript<'upgradeController'>[]
    //get energy
    recycle:    RestrictedPrimitiveDescript<'dismantle'>[]
    H_srcs:     RestrictedPrimitiveDescript<'harvest','energy'>[]
    W_energy:   RestrictedPrimitiveDescript<'withdraw'|'pickup','energy'>[]
    //consume energy
    build:      RestrictedPrimitiveDescript<'build'>[]
    fortify:    RestrictedPrimitiveDescript<'repair'>[]
    decayed:    RestrictedPrimitiveDescript<'repair'>[]
    repair:     RestrictedPrimitiveDescript<'repair'>[]
    anti_nuke:  RestrictedPrimitiveDescript<'repair'>[]
    //collect
    W_cntn:     RestrictedPrimitiveDescript<'withdraw'>[]
    W_link:     RestrictedPrimitiveDescript<'withdraw'>[]
    loot:       RestrictedPrimitiveDescript<'withdraw'>[]
    sweep:      RestrictedPrimitiveDescript<'withdraw'|'pickup'>[]
    compound:   RestrictedPrimitiveDescript<'withdraw'>[]
    //supply
    T_ext:      RestrictedPrimitiveDescript<'transfer','energy'>[]
    T_tower:    RestrictedPrimitiveDescript<'transfer','energy'>[]
    T_cntn:     RestrictedPrimitiveDescript<'transfer','energy'>[]
    T_boost:    RestrictedPrimitiveDescript<'transfer'>[]
    T_react:    RestrictedPrimitiveDescript<'transfer'>[]
    T_power:    RestrictedPrimitiveDescript<'transfer'>[]
    T_nuker:    RestrictedPrimitiveDescript<'transfer'>[]
    //central
    T_term:     RestrictedPrimitiveDescript<'transfer'>[]
    W_term:     RestrictedPrimitiveDescript<'withdraw'>[]
    T_fact:     RestrictedPrimitiveDescript<'transfer'>[]
    W_fact:     RestrictedPrimitiveDescript<'withdraw'>[]
}

type EnSource = FilterPoolKey<(WorkAction|CarryAction)&CollectAction,'energy'>
type EnSink =   FilterPoolKey<(WorkAction|CarryAction)&ConsumeAction,'energy'>
type ResSource = FilterPoolKey<CarryAction&CollectAction,ResourceConstant>
type ResSink =   FilterPoolKey<CarryAction&ConsumeAction,ResourceConstant>
type ResFlow = [
    from:   'storage' | ResSource,
    to:     'storage' | ResSink
]