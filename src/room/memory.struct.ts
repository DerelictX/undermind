interface RoomStructureList {
    wall_hits:      number
    towers:         Id<StructureTower>[]
    links:          LinkConfig
    labs:           LabConfig
    
    factory:       Id<StructureFactory>|null
    power_spawn:   Id<StructurePowerSpawn>|null
    nuker:         Id<StructureNuker>|null
    observer:      Id<StructureObserver>|null
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