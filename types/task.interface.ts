type ResSource = FilterCollectKey<CarryAction & CollectAction, ResourceConstant>
type ResSink = FilterConsumeKey<CarryAction & ConsumeAction, ResourceConstant>

type FilterCollectKey<T extends WorkAction | CarryAction, R extends ResourceConstant> =
    ValueTypes<{
        [K in keyof CollectTaskCache]:
        CollectTaskCache[K] extends RestrictedPrimitiveDescript<T, R>[] ? K : never
    }>

interface CollectTaskCache {
    //get energy
    recycle: RestrictedPrimitiveDescript<'dismantle'>[]
    H_srcs: RestrictedPrimitiveDescript<'harvest', 'energy'>[]
    W_energy: RestrictedPrimitiveDescript<'withdraw' | 'pickup', 'energy'>[]
    //collect
    W_cntn: RestrictedPrimitiveDescript<'withdraw'>[]
    W_link: RestrictedPrimitiveDescript<'withdraw'>[]
    loot: RestrictedPrimitiveDescript<'withdraw'>[]
    sweep: RestrictedPrimitiveDescript<'withdraw' | 'pickup'>[]
    compound: RestrictedPrimitiveDescript<'withdraw'>[]
    //central
    W_term: RestrictedPrimitiveDescript<'withdraw'>[]
    W_fact: RestrictedPrimitiveDescript<'withdraw'>[]
}

type FilterConsumeKey<T extends WorkAction | CarryAction, R extends ResourceConstant> =
    ValueTypes<{
        [K in keyof ConsumeTaskCache]:
        ConsumeTaskCache[K] extends RestrictedPrimitiveDescript<T, R>[] ? K : never
    }>

interface ConsumeTaskCache {
    //controller
    U_ctrl: RestrictedPrimitiveDescript<'upgradeController'>[]
    downgraded: RestrictedPrimitiveDescript<'upgradeController'>[]
    //consume energy
    build: RestrictedPrimitiveDescript<'build'>[]
    fortify: RestrictedPrimitiveDescript<'repair'>[]
    decayed: RestrictedPrimitiveDescript<'repair'>[]
    repair: RestrictedPrimitiveDescript<'repair'>[]
    anti_nuke: RestrictedPrimitiveDescript<'repair'>[]
    //supply
    T_ext: RestrictedPrimitiveDescript<'transfer', 'energy'>[]
    T_tower: RestrictedPrimitiveDescript<'transfer', 'energy'>[]
    T_cntn: RestrictedPrimitiveDescript<'transfer', 'energy'>[]
    T_boost: RestrictedPrimitiveDescript<'transfer'>[]
    T_react: RestrictedPrimitiveDescript<'transfer'>[]
    T_power: RestrictedPrimitiveDescript<'transfer'>[]
    T_nuker: RestrictedPrimitiveDescript<'transfer'>[]
    //central
    T_term: RestrictedPrimitiveDescript<'transfer'>[]
    T_fact: RestrictedPrimitiveDescript<'transfer'>[]
}