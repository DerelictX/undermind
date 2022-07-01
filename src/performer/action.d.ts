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

type AnyDescript<T extends AnyAction> =
    T extends PrimitiveAction ? PrimitiveDescript<T> :
    T extends keyof VirtualAction ? VirtualDescript<T> :
    never

type PrimitiveDescript<T extends PrimitiveAction> = T extends PrimitiveAction ? {
    action: T
    args:   CachedArgs<Parameters<Creep[T]>>
} : never

type RestrictedPrimitiveDescript<T extends WorkAction|CarryAction,Res extends ResourceConstant> =
        T extends WorkAction|CarryAction ? {
    action: T
    args:CachedArgs<
        T extends "harvest"
            ? [target: ("energy" extends Res ? Source : never)
            | (MineralConstant extends Res ? Mineral : never)
            | (DepositConstant extends Res ? Deposit : never)]
        : T extends Exclude<WorkAction,"harvest">
            ? Res extends "energy" ? Parameters<Creep[T]> : never
        : T extends "withdraw"|"transfer"
            ? [target: Parameters<Creep[T]>[0], resourceType: Res, amount?: Parameters<Creep[T]>[2]]
        : T extends "drop"
            ? [resourceType: Res, amount?: Parameters<Creep[T]>[1]]
        : T extends "pickup" ? [target: Resource<Res>]
        : T extends "generateSafeMode"
            ? Res extends "G" ? Parameters<Creep[T]> : never
        : never>
} : never

type VirtualDescript<T extends keyof VirtualAction> = T extends keyof VirtualAction ? {
    action: T
    args:   VirtualAction[T]
} : never
