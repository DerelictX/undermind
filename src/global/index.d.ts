type RoomTypes = 'owned' | 'reserved' | 'highway' | 'claimed' | 'neutral'
type RoomRecord<T> = Record<string,T|undefined>

interface Memory extends PathMemory,GlobalStaticPool {
    username:   string
    creep_SN:   number
    room_type:  RoomRecord<RoomTypes>

    terminal:   {
        demand: Partial<Record<ResourceConstant,{[room: string]: number}>>
        overflow: Order[]
    }
    factory:    {
        demand: Partial<Record<ResourceConstant,number>>[]
    }
    H_srcs: RoomRecord<Id<Source>[]>
    W_cntn: RoomRecord<Id<StructureContainer>[]>
    T_cntn: RoomRecord<Id<StructureContainer>[]>
}

interface PathMemory {
    _edge_exits: RoomRecord<{
        [toRoom: string]: RoomPosition[]
    }>
    _closest_owned: RoomRecord<{
        root:   string
        prev:   string
        dist:   number
        time:   number
    }>
    threat_level: RoomRecord<number>
}

type StaticPoolPart<T extends GlobalLoopType> = T extends GlobalLoopType ?
    Record<StaticPoolKeyTypeMap[T], Looper & SpawnCaller<T>> : never
interface GlobalStaticPool {
    _loop_id:
        & StaticPoolPart<'_source'>
        & StaticPoolPart<'_mineral'>
        & StaticPoolPart<'_deposit'>
        & (StaticPoolPart<'_upgrade'>
        | StaticPoolPart<'_reserve'>)
}

type GlobalLoopType = keyof StaticPoolKeyTypeMap
interface StaticPoolKeyTypeMap {
    _source:    Id<Source>
    _mineral:   Id<Mineral>
    _deposit:   Id<Deposit>
    _upgrade:   Id<StructureController>
    _reserve:   Id<StructureController>
}

type SpawnCaller<T extends GlobalLoopType = GlobalLoopType> 
        = T extends GlobalLoopType ? {
    dest_room:  string  //creep第一个要前往的房间
    task_type:  T
    loop_key:   StaticPoolKeyTypeMap[T]
} : never

type SpawnTask = {
    _caller:    SpawnCaller
    _body:  {
        generator:  body_generator_name
        workload:   number
        mobility?:  number
        _boost?:    Partial<Record<BodyPartConstant,MineralBoostConstant>>
    }
    _class: CreepMemory['_class']
}

type body_generator_name =
    | "W" | "C" | "WC" | "Wc"
    | "A" | "R" | "H" | "Cl"
    | "DH"

type CreepLifeCycle = {
    boost:      boolean
    unboost:    boolean
}