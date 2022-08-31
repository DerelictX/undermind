type ShadowedPick<T, K extends keyof T> = {
    [P in K]: T[P];
} & {
    [P in Exclude<keyof T, K>]?: undefined
}

interface RoomMemory {
    _typed:     OwnedRoomMemory | ReservedRoomMemory | HighwayRoomMemory
    _dynamic:   {[k in keyof DynamicTaskPool]?: PosedCreepTask<TargetedAction>[]}
}

type owned_room_role =
    |"HarvesterSource0"|"HarvesterSource1"|'HarvesterMineral'
    |"Upgrader"|"Builder"|"Maintainer"|'EnergySupplier'
    |"Collector"|"Supplier"|"Chemist"
interface OwnedRoomMemory {
    _type:      'owned'
    _struct:    RoomStructureList
    _static:    ShadowedPick<FullTaskPool,keyof (OwnedTaskPool & SourceTaskPool & MineralTaskPool)>
    _spawn:     SpawnTask[]
    _looper:    ShadowedPick<{[R in AnyRole]: Looper},owned_room_role>
}

type reserved_room_role =
    |"HarvesterSource0"|"HarvesterSource1"|"HarvesterSource2"
    |"Builder"|"Maintainer"|'EnergySupplier'
    |"Collector"
interface ReservedRoomMemory {
    _type:      'reserved'
    _struct?:   undefined
    _static:    ShadowedPick<FullTaskPool,keyof (ReservedTaskPool & SourceTaskPool)>
    _spawn:     string
    _looper:    ShadowedPick<{[R in AnyRole]: Looper},reserved_room_role>
}

type highway_room_role =
    |"HarvesterDeposit"|"Collector"
interface HighwayRoomMemory {
    _type:      'highway'
    _struct?:   undefined
    _static:    ShadowedPick<FullTaskPool,keyof HighwayTaskPool>
    _spawn:     string
    _looper:    ShadowedPick<{[R in AnyRole]: Looper},highway_room_role>
}