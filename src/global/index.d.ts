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
    _loop_room: RoomRecord<Partial<Record<RoomLoopType,Looper>>>
    _loop_flag: RoomRecord<Looper & SpawnCaller<FlagLoopType>>
}

type RoomLoopType = '_collect' | '_supply' | '_build' | '_maintain' | '_fortify'
type FlagLoopType = '_observe'
type GlobalLoopType = keyof StaticPoolKeyTypeMap
interface StaticPoolKeyTypeMap {
    _source:    Id<Source>
    _mineral:   Id<Mineral>
    _deposit:   Id<Deposit>
    _upgrade:   Id<StructureController>
    _reserve:   Id<StructureController>
}

type AnyLoopType = GlobalLoopType | RoomLoopType | FlagLoopType

type SpawnCaller<T extends AnyLoopType>
= T extends GlobalLoopType ? {
    dest_room:  string
    loop_type:  '_loop_id'
    task_type:  T
    loop_key:   StaticPoolKeyTypeMap[T]
} : T extends RoomLoopType ? {
    dest_room:  string
    loop_type:  '_loop_room'
    task_type:  T
    loop_key:   string
} : T extends FlagLoopType ? {
    dest_room:  string
    loop_type:  '_loop_flag'
    task_type:  T
    loop_key:   string
} : never

type SpawnTask<T extends AnyLoopType> = T extends AnyLoopType ? {
    _caller:    SpawnCaller<T>
    _body:  {
        generator:  body_generator_name
        workload:   number
        mobility?:  number
        boost?:     Partial<Record<BodyPartConstant,MineralBoostConstant>>
    }
    _class: CreepMemory['_class']
} : never

type body_generator_name =
    | "W" | "C" | "WC" | "Wc"
    | "A" | "R" | "H" | "Cl"
    | "DH"

type CreepLifeCycle = {
    boost:     string | null
    unboost:   string | null
}