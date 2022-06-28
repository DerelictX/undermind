type AnyAction = PrimitiveAction | keyof VirtualAction

type PrimitiveAction =
    | WorkAction
    | CarryAction
    | ClaimAction
    | FightAction

type ConsumeAction =
    |"build"|"repair"|"upgradeController"
    |"transfer"|"drop"|"generateSafeMode"
type CollectAction =
    |"harvest"|"dismantle"
    |"withdraw"|"pickup"

type WorkAction =
    |"harvest"|"dismantle"
    |"build"|"repair"|"upgradeController"
type CarryAction =
    |"withdraw"|"transfer"
    |"pickup"|"drop"
    |"generateSafeMode"

type ClaimAction =
    |"attackController"|"reserveController"|"claimController"
type FightAction =
    |"attack"|"rangedAttack"|"rangedMassAttack"
    |"heal"|"rangedHeal"

type TargetedAction = Exclude<PrimitiveAction,"drop"|"rangedMassAttack">
    
type VirtualAction = {
    approach:   [pos:RoomPosition, range:number],
    escape:     [pos:RoomPosition, range:number],
    prejudge_full:  [amount:number],
    prejudge_empty: [amount:number],
    full_hits:      [target:Id<Structure>,amount:number],
}

type CachedArgs<T extends any[]> = {
    [P in keyof T] : T[P] extends _HasId
        ? Id<T[P]> : T[P];
}

type ActionDescript<T extends AnyAction> = T extends PrimitiveAction ? {
    action: T
    args:   CachedArgs<Parameters<Creep[T]>>
} : T extends keyof VirtualAction ? {
    action: T
    args:   VirtualAction[T]
} : never;
