interface RoomStructureList {
    spawns:         SpawnConfig
    towers:         Id<StructureTower>[]
    links:          LinkConfig
    labs:           LabConfig
    
    factory:        Id<StructureFactory>|null
    power_spawn:    Id<StructurePowerSpawn>|null
    nuker:          Id<StructureNuker>|null
    observer:       Id<StructureObserver>|null
    
    wall_hits:      number
}

interface SpawnConfig {
    t0: SpawnTask[]
    t1: SpawnTask[]
    t2: SpawnTask[]
    t3: SpawnTask[]
}

interface LinkConfig {
    nexus:      Id<StructureLink>[]
    ins:        Id<StructureLink>[]
    outs:       Id<StructureLink>[]
}

interface LabConfig {
    ins:        Id<StructureLab>[]
    outs:       Id<StructureLab>[]
    reaction:   MineralCompoundConstant|null
    boosts:     MineralBoostConstant[]
}