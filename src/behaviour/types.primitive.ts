    
type PrimitiveBehavior =
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

type ContinualAction = Exclude<PrimitiveBehavior,CarryAction|"reserveController">
    
type ActionDescript<T extends PrimitiveBehavior> = T extends PrimitiveBehavior ? {
    bhvr_name: T
    args:   CachedArgs<Parameters<Creep[T]>>
} : never;

type CachedArgs<T extends any[]> = {
    [P in keyof T] : T[P] extends _HasId
        ? Id<T[P]> : T[P];
}

type ActionPerformer<T extends PrimitiveBehavior>
    = (creep:Creep, args:CachedArgs<Parameters<Creep[T]>>) => ScreepsReturnCode
