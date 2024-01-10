interface RoomMemory extends Partial<RoomStructureList> {

}

interface RoomStructureList {
    spawns: SpawnConfig
    wall_hits: number
    towers: Id<StructureTower>[]
    links: LinkConfig
    labs: LabConfig
    factory: FactoryConfig

    observer: ObserverConfig
    power_spawn: PowerSpawnConfig
    nuker: NukerConfig
}
