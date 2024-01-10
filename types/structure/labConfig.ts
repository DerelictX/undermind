interface LabConfig {
    ins: Id<StructureLab>[]
    outs: Id<StructureLab>[]
    reaction: MineralCompoundConstant | null
    boost_type: Partial<Record<Id<StructureLab>, MineralBoostConstant>>
    boost_lab: Partial<Record<MineralBoostConstant, Id<StructureLab>>>
    boost_amount: Partial<Record<MineralBoostConstant, number>>
}

type ValueTypes<T> = T[keyof T]
type base = keyof typeof REACTIONS.O & keyof typeof REACTIONS.H
type tier1_comp<R extends base> = ValueTypes<typeof REACTIONS[R]> & keyof typeof REACTIONS.OH
type tier2_comp<R extends tier1_comp<base>> = ValueTypes<typeof REACTIONS[R]>
type tier3_comp<R extends tier2_comp<tier1_comp<base>>> = ValueTypes<typeof REACTIONS[R]>
type tier3_t1<R extends tier1_comp<base>> =
    tier2_comp<R> extends tier2_comp<tier1_comp<base>> ? tier3_comp<tier2_comp<R>> : never

type Xides<R extends tier1_comp<base>> = R | tier2_comp<R> | tier3_t1<R>
type Oxides = ValueTypes<typeof REACTIONS.O>
type Hydrides = ValueTypes<typeof REACTIONS.H>

type companion_base<R extends MineralConstant | MineralBaseCompoundsConstant,
    S extends keyof typeof REACTIONS[R] = keyof typeof REACTIONS[R]>
    = S extends keyof typeof REACTIONS[R] ?
    typeof REACTIONS[R][S] extends MineralBaseCompoundsConstant ? S : never : never
