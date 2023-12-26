interface RoomStructureList {
    spawns: SpawnConfig
    wall_hits: number
    towers: Id<StructureTower>[]
    links: LinkConfig
    labs: LabConfig
    factory: FactoryConfig & Looper

    observer: ObserverConfig
    power_spawn: PowerSpawnConfig
    nuker: NukerConfig
}

interface SpawnConfig {
    t0: SpawnTask<AnyLoopType>[]
    t1: SpawnTask<AnyLoopType>[]
    t2: SpawnTask<AnyLoopType>[]
    t3: SpawnTask<AnyLoopType>[]
}

interface LinkConfig {
    nexus: Id<StructureLink>[]
    ins: Id<StructureLink>[]
    outs: Id<StructureLink>[]
}

interface LabConfig {
    ins: Id<StructureLab>[]
    outs: Id<StructureLab>[]
    reaction: MineralCompoundConstant | null
    boost_type: Partial<Record<Id<StructureLab>, MineralBoostConstant>>
    boost_lab: Partial<Record<MineralBoostConstant, Id<StructureLab>>>
    boost_amount: Partial<Record<MineralBoostConstant, number>>
}

interface FactoryConfig {
    fact_id: Id<StructureFactory> | null
    product?: CommodityConstant
    operate?: number
}

interface ObserverConfig {
    ob_id: Id<StructureObserver> | null
    observing: string | null | undefined
    BFS_open: string[]
    start_time: number
}

interface NukerConfig {
    nuker_id: Id<StructureNuker> | null
}

interface PowerSpawnConfig {
    power_spawn_id: Id<StructurePowerSpawn> | null
}