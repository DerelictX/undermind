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

/**动作描述 */
/*
type PrimitiveDescript<T extends PrimitiveAction> = T extends PrimitiveAction ? {
    action: T
    args:   CachedArgs<Parameters<Creep[T]>>
} : never

type Posed<T extends PrimitiveDescript<TargetedAction>> = 
    {pos: RoomPosition} & T
*/

/**限定work和carry动作的资源类型 */
type RestrictedPrimitiveDescript<
    T extends WorkAction|CarryAction,
    Res extends ResourceConstant = ResourceConstant
> = T extends WorkAction|CarryAction ? {
    action: T
    args:   CachedArgs<
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
    pos:    RoomPosition
} : never