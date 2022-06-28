
interface RoomMemory {
    structures: RoomStructureList

    _static:    Partial<StaticTaskPool>
    _collect:   {[k in keyof CollectTaskPool]?: PosedCreepTask<CollectAction>[]}
    _consume:   {[k in keyof ConsumeTaskPool]?: PosedCreepTask<ConsumeAction&WorkAction>[]}
    _supply:    {[k in keyof ConsumeTaskPool]?: PosedCreepTask<"transfer"|"generateSafeMode">[]}

    _spawn:     {[R in GeneralistRole]: RoleSpawnLoop}
}

type RoleSpawnLoop = {
    body_parts:     BodyPartConstant[]
    boost_queue:    MineralBoostConstant[]
    queued:         number
} & Looper

interface RoomStructureList {
    factory?:       Id<StructureFactory>|null
    power_spawn?:   Id<StructurePowerSpawn>|null
    nuker?:         Id<StructureNuker>|null
    observer?:      Id<StructureObserver>|null

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