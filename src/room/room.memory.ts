
type RoomTypes = RoomMemory['_typed']['_type']
interface RoomMemory {
    _typed:     OwnedRoomMemory | ReservedRoomMemory | HighwayRoomMemory | NeutralRoomMemory
    _dynamic:   {[k in keyof DynamicTaskPool]?: DynamicTaskPool[k]}
    _spawn:     string  //生爬的房间名
}

type owned_room_role =
    |"Source0"|"Source1"|'Mineral'
    |"Upgrade"|"Build"|"Maintain"
    |"Collector"|"Supplier"
interface OwnedRoomMemory {
    _type:      'owned'
    _struct:    RoomStructureList
    _static:    ShadowedPick<FullTaskPool,keyof (OwnedTaskPool & SourceTaskPool & MineralTaskPool)>
    //_looper:    ShadowedPick<{[R in RoomLoopKey]: Looper},owned_room_role>
    _looper:    ObserveThis & {[R in owned_room_role]: Looper}
}

type reserved_room_role =
    |"Source0"|"Source1"|"Reserve"
    |"Build"|"Maintain"
    |"Collector"
interface ReservedRoomMemory {
    _type:      'reserved'
    _static:    ShadowedPick<FullTaskPool,keyof (ReservedTaskPool & SourceTaskPool)>
    _looper:    ObserveThis & {[R in reserved_room_role]: Looper}
}

type highway_room_role =
    |"Deposit"|"Collector"
interface HighwayRoomMemory {
    _type:      'highway'
    _static:    ShadowedPick<FullTaskPool,keyof HighwayTaskPool>
    _looper:    ObserveThis & {[R in highway_room_role]: Looper}
}

/**白板房，啥也不干 */
type ObserveThis = {Observe:Looper}
interface NeutralRoomMemory{
    _type:      'neutral'
    _static:    ShadowedPick<FullTaskPool,never>
    _looper:    ObserveThis
}