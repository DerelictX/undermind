interface PowerCreepMemory {
    _move?:{
        dest: {x:number,y:number,room:string},
        time: number,
        path: string,
        room: string
    }
    _hike?:{
        from:   string
        to:     string
        route:{
            exit: ExitConstant
            room: string
        }[]
    }
    _tasks: PowerActionDescript<PowerAction>[]
    _power: {power:PowerConstant, target:Id<Structure|Source|Mineral>}[]
}

type PowerAction = |'withdraw'|'transfer'|'renew'|'enableRoom'
type PowerActionDescript<T extends PowerAction> = T extends PowerAction ? {
    action: T
    args:   CachedArgs<Parameters<PowerCreep[T]>>
} : never

type PowerTaskPool = {
    [PWR_REGEN_SOURCE]:     Id<Source>
    [PWR_REGEN_MINERAL]:    Id<Mineral>

    [PWR_OPERATE_SPAWN]:    Id<StructureSpawn>
    [PWR_OPERATE_TOWER]:    Id<StructureTower>
    [PWR_OPERATE_LAB]:      Id<StructureLab>
    [PWR_OPERATE_EXTENSION]:    Id<StructureStorage>

    [PWR_OPERATE_STORAGE]:  Id<StructureStorage>
    [PWR_OPERATE_TERMINAL]: Id<StructureTerminal>
    [PWR_OPERATE_FACTORY]:  Id<StructureFactory>

    [PWR_OPERATE_OBSERVER]:     Id<StructureObserver>
    [PWR_OPERATE_POWER]:        Id<StructurePowerSpawn>
    [PWR_OPERATE_CONTROLLER]:   Id<StructureController>
}