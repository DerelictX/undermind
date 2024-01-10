type StorePropertiesOnly = { [P in ResourceConstant]: number } &
    { [P in Exclude<ResourceConstant, ResourceConstant>]: 0 }

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
