type FullTaskPool =
    &SourceTaskPool&MineralTaskPool
    &OwnedTaskPool&ReservedTaskPool&HighwayTaskPool

interface SourceTaskPool {
    H_srcs:     Posed<RestrictedPrimitiveDescript<'harvest','energy'>>[]
    T_src0:     Posed<RestrictedPrimitiveDescript<'transfer'|'repair'|'build','energy'>>[]
    T_src1:     Posed<RestrictedPrimitiveDescript<'transfer'|'repair'|'build','energy'>>[]
    W_cntn:     Posed<PrimitiveDescript<'withdraw'>>[]
    T_cntn:     Posed<RestrictedPrimitiveDescript<'transfer','energy'>>[]
}

interface MineralTaskPool {
    H_mnrl:     Posed<RestrictedPrimitiveDescript<'harvest',MineralConstant>>[]
    T_mnrl:     Posed<RestrictedPrimitiveDescript<'transfer',MineralConstant>>[]
}

interface OwnedTaskPool {
    W_ctrl:     Posed<RestrictedPrimitiveDescript<'withdraw','energy'>>[]
    U_ctrl:     Posed<PrimitiveDescript<'upgradeController'>>[]
}

interface ReservedTaskPool {
    T_src2:     Posed<RestrictedPrimitiveDescript<'transfer'|'repair','energy'>>[]
    A_core:     Posed<PrimitiveDescript<'attack'>>[]
    A_ctrl:     Posed<PrimitiveDescript<'attackController'>>[]
    R_ctrl:     Posed<PrimitiveDescript<'reserveController'>>[]
}

interface HighwayTaskPool {
    A_bank:     Posed<PrimitiveDescript<'attack'>>[]
}