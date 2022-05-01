    
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

type ContinualAction = Exclude<PrimitiveAction,CarryAction|"reserveController">

type CachedArgs<T extends any[]> = {
    [P in keyof T] : T[P] extends _HasId
        ? Id<T[P]> : T[P];
}

type ActionDescript<T extends PrimitiveAction> = T extends PrimitiveAction ? {
    action: T
    args:   CachedArgs<Parameters<Creep[T]>>
    pos:    RoomPosition
} : never;
