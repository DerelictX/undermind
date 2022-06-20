
interface RoomMemory {
    structures: RoomStructureList

    _static:    StaticController
    _consume:   Partial<ConsumeController>
    _supply:    Partial<SupplyController>

    _spawn:  {[R in CreepClassName]: RoleSpawnLoop}

    //reaction:   (MineralConstant|MineralCompoundConstant)[]
    //boost:      MineralBoostConstant[]
}

type RoleSpawnLoop = {
    body_parts:     BodyPartConstant[]
    boost_queue:    {
        part:BodyPartConstant
        boost:MineralBoostConstant}[]
    queued:         number
} & Looper

interface RoomStructureList {
    factory:        null|Id<StructureFactory>
    power_spawn:    null|Id<StructurePowerSpawn>
    nuker:          null|Id<StructureNuker>
    observer:       null|Id<StructureObserver>

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