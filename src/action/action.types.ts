type AnyAction = PrimitiveAction | keyof VirtualAction

type PrimitiveAction =
    | WorkAction
    | CarryAction
    | ClaimAction
    | FightAction

type WorkAction =
    |"harvest"|"dismantle"
    |"build"|"repair"|"upgradeController"
type CarryAction =
    |"generateSafeMode"
    |"withdraw"|"transfer"
    |"pickup"|"drop"
type ClaimAction =
    |"attackController"|"reserveController"|"claimController"
type FightAction =
    |"attack"|"rangedAttack"|"rangedMassAttack"
    |"heal"|"rangedHeal"

type VirtualAction = {
    prejudge_full:  [amount:number],

    prejudge_empty: [amount:number],
    
    approach:   [pos:RoomPosition, range:number]
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
