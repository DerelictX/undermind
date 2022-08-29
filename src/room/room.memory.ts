
interface RoomMemory {
    structures: RoomStructureList

    _static:    Partial<StaticTaskPool>
    _dynamic:   {[k in keyof DynamicTaskPool]?: PosedCreepTask<TargetedAction>[]}

    _spawn_loop:    {[R in AnyRole]: RoleSpawnLoop}
    _spawn_queue:   SpawnTask[]
}

type RoleSpawnLoop = Looper
type SpawnTask = {
    _caller: {
        room_name:  string
        looper:     AnyRole
    }
    _body:  {
        generator:  body_generator_name
        workload:   number
    }
    _class:     CreepMemory['_class']
}

type body_generator_name =
    | "W" | "C" | "WC" | "Wc"
    | "A" | "R" | "H" | "Cl"

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