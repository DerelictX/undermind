type RoomTypes = 'owned' | 'reserved' | 'highway' | 'claimed' | 'neutral'
type RoomRecord<T> = Record<string, T | undefined>

interface Memory extends PathMemory {
    username: string
    creep_SN: number
    visual: string
    room_type: RoomRecord<RoomTypes>

    terminal: {
        demand: Partial<Record<ResourceConstant, { [room: string]: number }>>
        overflow: Order[]
    }
    factory: {
        demand: Partial<Record<ResourceConstant, number>>[]
    }
    H_srcs: RoomRecord<Id<Source>[]>
    W_cntn: RoomRecord<Id<StructureContainer>[]>
    T_cntn: RoomRecord<Id<StructureContainer>[]>
}

interface RouteNode {
    root: string
    prev: string
    dist: number
    time: number
}

interface PathMemory {
    _edge_exits: RoomRecord<{
        [toRoom: string]: RoomPosition[]
    }>
    _closest_owned: RoomRecord<RouteNode>
    threat_level: RoomRecord<number>
}

type RoomLoopType = '_collect' | '_supply' | '_build' | '_maintain' | '_fortify' | '_chemist'
type ObjectLoopType = '_source' | '_mineral' | '_upgrade' | '_reserve'
type FlagLoopType = '_observe' | '_deposit' | '_feed'
type AnyLoopType = ObjectLoopType | RoomLoopType | FlagLoopType

type SpawnTask = {
    _caller: string
    _body: CreepBodyConfig
    _class: CreepMemory['_class']
}

type body_generator_name =
    | "W" | "C" | "WC" | "Wc"
    | "A" | "R" | "H" | "Cl"
    | "DH"

type CreepBodyConfig = {
    generator: body_generator_name
    workload: number
    mobility?: number
    boost?: Partial<Record<BodyPartConstant, MineralBoostConstant>>
}

type CreepLifeCycle = {
    boost?: Partial<Record<BodyPartConstant, MineralBoostConstant>>
    boost_room?: string
    unboost?: string
}