
interface RoomMemory {
    structures: RoomStructureList
    tasks:      RoomTaskList

    spawn_loop: {[R in AnyRoleName]: RoleSpawnLoop}

    reaction:   (MineralConstant|MineralCompoundConstant)[]
    boost:      MineralBoostConstant[]

    import_cost:    {[m in ResourceConstant]:number}
}

interface RoleSpawnLoop {
    succeed_time:   number,
    succ_interval:  number,
    body_parts:     BodyPartConstant[]
    boost_queue:    {
        part:BodyPartConstant
        boost:MineralBoostConstant}[]
    queued:         number
}

interface RoomTaskList{
    harvest:    StaticHarvestTask[],
    harvest_m:  StaticHarvestTask[],
    upgrade:    StaticUpgradeTask[],
}

interface RoomStructureList {
    factory:        null|Id<StructureFactory>
    power_spawn:    null|Id<StructurePowerSpawn>
    nuker:          null|Id<StructureNuker>
    observer:       null|Id<StructureObserver>

    towers:         Id<StructureTower>[]
    
    links_in:       Id<StructureLink>[]
    link_nexus:     Id<StructureLink>[]
    links_out:      Id<StructureLink>[]

    containers_in:  Id<StructureContainer>[]
    containers_out: Id<StructureContainer>[]

    labs_in:        Id<StructureLab>[]
    labs_out:       Id<StructureLab>[]
    
    wall_hits:      number
}
