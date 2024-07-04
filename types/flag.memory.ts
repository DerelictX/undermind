type AnyLoopType =
    | '_collect' | '_supply' | '_chemist'
    | '_build' | '_maintain' | '_fortify'
    | '_source' | '_mineral' | '_deposit'
    | '_feed' | '_upgrade' | '_reserve'
    | '_observe' | 'attack_squad'

interface FlagMemory {
    _loop: {
        _loop_type: AnyLoopType
        _time: number
        interval: number
    }
}

interface SquadMemory extends MoveMemory {
    enemy?: Id<Creep | AnyOwnedStructure>;
    pending?: boolean

    head_pos: RoomPosition
    target_pos: RoomPosition
    step?: PathStep

    size: number
    member: string[]
    formation: 'square' | 'snake'
    offset_pos: number
}