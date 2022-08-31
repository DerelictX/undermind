
interface RoomMemory {
    _static:    StaticTaskPool & RoomStructureList
    _dynamic:   {[k in keyof DynamicTaskPool]?: PosedCreepTask<TargetedAction>[]}

    _spawn_loop:    {[R in AnyRole]: Looper}
    _spawn_queue:   SpawnTask[]
}

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