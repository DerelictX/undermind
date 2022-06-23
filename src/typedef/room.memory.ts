
interface RoomMemory {
    structures: RoomStructureList

    _static:    Partial<CachedPool<StaticTaskPool>>
    _consume:   Partial<CachedPool<ConsumeTaskPool>>
    _collect:   Partial<CachedPool<CollectTaskPool>>

    _spawn:  {[R in CreepClassName]: RoleSpawnLoop}
}

type RoleSpawnLoop = {
    body_parts:     BodyPartConstant[]
    boost_queue:    MineralBoostConstant[]
    queued:         number
} & Looper

interface RoomStructureList {
    factory?:       Id<StructureFactory>
    power_spawn?:   Id<StructurePowerSpawn>
    nuker?:         Id<StructureNuker>
    observer?:      Id<StructureObserver>

    towers:         Id<StructureTower>[]
    links:          LinkConfig
    containers:     ContainerConfig
    labs:           LabConfig
    wall_hits:      number
}

interface LinkConfig {
    nexus:      Id<StructureLink>[]
    ins:        Id<StructureLink>[]
    outs:       Id<StructureLink>[]
}

interface ContainerConfig {
    ins:        Id<StructureContainer>[]
    outs:       Id<StructureContainer>[]
}

interface LabConfig {
    ins:        Id<StructureLab>[]
    outs:       Id<StructureLab>[]
    reaction:   MineralCompoundConstant|null
    boosts:     MineralBoostConstant[]
}