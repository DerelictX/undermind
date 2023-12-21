type StorePropertiesOnly = { [P in ResourceConstant]: number } &
    { [P in Exclude<ResourceConstant, ResourceConstant>]: 0 }

type Looper = {
    reload_time: number
    interval: number
}

type CachedArgs<T extends Parameters<Creep[PrimitiveAction]>> = {
    [P in keyof T]: T[P] extends _HasId
        ? Id<T[P]> : T[P];
}

type ShadowedPick<T, K extends keyof T> = {
    [P in K]: T[P];
} & {
    [P in Exclude<keyof T, K>]?: undefined
}
type FilterOptional<T extends object> = Pick<T, Exclude<{
    [K in keyof T]: T extends Record<K, T[K]>
        ? K : never
}[keyof T], undefined>>;

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
