type AnyLoopType =
    | '_collect' | '_supply' | '_chemist'
    | '_build' | '_maintain' | '_fortify'
    | '_source' | '_mineral' | '_deposit'
    | '_feed' | '_upgrade' | '_reserve'
    | '_observe'

interface FlagMemory {
    _class: '_loop' | '_squad'
    _loop: {
        _loop_type: AnyLoopType
        _time: number
        interval: number
    }
    _squad?: SquadMemory
}

interface SquadMemory extends MoveMemory {
    head_pos: RoomPosition
    offset_head: number
    offset_pos: number
    member: Record<string, 0 | 1 | 2 | 3>
}