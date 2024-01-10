type RoomTypes = 'owned' | 'reserved' | 'highway' | 'claimed' | 'neutral'
type RoomRecord<T> = Record<string, T | undefined>

interface Memory extends PathMemory {
    username: string
    creep_SN: number
    visual: string
    room_type: RoomRecord<RoomTypes>
    flag_heap: string[];

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
