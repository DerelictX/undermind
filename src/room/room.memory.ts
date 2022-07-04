
interface RoomMemory {
    structures: RoomStructureList

    _static:    Partial<StaticTaskPool>
    _dynamic:   {[k in keyof DynamicTaskPool]?: PosedCreepTask<TargetedAction>[]}

    _spawn_loop:    {[R in AnyRole]: RoleSpawnLoop}
    _spawn_queue:   SpawnTask[]
}

type RoleSpawnLoop = Looper
type SpawnTask = {
    role_name:  AnyRole
    workload:   number
    movecost:   number
    _class:     CreepMemory['_class']
}[]

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