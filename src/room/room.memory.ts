type ShadowedPick<T, K extends keyof T> = {
    [P in K]: T[P];
} & {
    [P in Exclude<keyof T, K>]?: undefined
}
type FilterOptional<T extends object> = Pick<T, Exclude<{
    [K in keyof T]: T extends Record<K, T[K]>
    ? K : never
}[keyof T], undefined>>;

type RoomTypes = RoomMemory['_typed']['_type']
interface RoomMemory {
    _typed:     OwnedRoomMemory | ReservedRoomMemory | HighwayRoomMemory | NeutralRoomMemory
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
    _spawn:     SpawnTask[] //孵化队列
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
    _spawn?:    string  //生爬的房间名
    _looper:    ShadowedPick<{[R in AnyRole]: Looper},reserved_room_role>
}

type highway_room_role =
    |"HarvesterDeposit"|"Collector"
interface HighwayRoomMemory {
    _type:      'highway'
    _struct?:   undefined
    _static:    ShadowedPick<FullTaskPool,keyof HighwayTaskPool>
    _spawn?:    string  //生爬的房间名
    _looper:    ShadowedPick<{[R in AnyRole]: Looper},highway_room_role>
}

/**白板房，啥也不干 */
interface NeutralRoomMemory{
    _type:      'neutral'
    _struct?:   undefined
    _static:    ShadowedPick<FullTaskPool,never>
    _spawn?:    string  ////生爬的房间名
    _looper:    ShadowedPick<{[R in AnyRole]: Looper},never>
}