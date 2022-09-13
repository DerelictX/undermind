type RoomMemMap = {
    owned:      OwnedRoomMemory
    reserved:   ReservedRoomMemory
    highway:    HighwayRoomMemory
    neutral:    NeutralRoomMemory
}

type RoomLoopHandler<T extends RoomTypes> = {
    [r in keyof RoomMemMap[T]['_looper']]: (
        room:Room, pool:RoomMemMap[T]['_static'], looper:Looper
    ) => RoleImpl|null
}

type SpawnCaller<T extends RoomTypes> = T extends RoomTypes ? {
    room_name:  string
    room_type:  T
    loop_key:   keyof RoomMemMap[T]['_looper']
} : never

type SpawnTask = {
    _caller:    SpawnCaller<RoomTypes>
    _body:  {
        generator:  body_generator_name
        workload:   number
        mobility?:  number
    }
    _class:     CreepMemory['_class']
}
type RoleImpl = Omit<SpawnTask,'_caller'>

type body_generator_name =
    | "W" | "C" | "WC" | "Wc"
    | "A" | "R" | "H" | "Cl"
    | "DH"