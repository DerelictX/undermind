
interface RoomMemory {
    structures: RoomStructureList

    _static:    Partial<StaticTaskPool>
    _dynamic:   {[k in keyof DynamicTaskPool]?: PosedCreepTask<TargetedAction>[]}

    _spawn:     {[R in AnyRole]: RoleSpawnLoop}
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