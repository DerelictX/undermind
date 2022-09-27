type FullTaskPool =
    &SourceTaskPool&MineralTaskPool
    &OwnedTaskPool&ReservedTaskPool&HighwayTaskPool

interface SourceTaskPool {
    H_srcs:     RestrictedPrimitiveDescript<'harvest','energy'>[]
    T_src0:     RestrictedPrimitiveDescript<'transfer'|'repair'|'build','energy'>[]
    T_src1:     RestrictedPrimitiveDescript<'transfer'|'repair'|'build','energy'>[]
    W_cntn:     RestrictedPrimitiveDescript<'withdraw',ResourceConstant>[]
    T_cntn:     RestrictedPrimitiveDescript<'transfer','energy'>[]
}

interface MineralTaskPool {
    H_mnrl:     RestrictedPrimitiveDescript<'harvest',MineralConstant>[]
    T_mnrl:     RestrictedPrimitiveDescript<'transfer',MineralConstant>[]
}

interface OwnedTaskPool {
    W_ctrl:     RestrictedPrimitiveDescript<'withdraw','energy'>[]
    U_ctrl:     RestrictedPrimitiveDescript<'upgradeController'>[]
}

interface ReservedTaskPool {
    T_src2:     RestrictedPrimitiveDescript<'transfer'|'repair','energy'>[]
}

interface HighwayTaskPool {
}