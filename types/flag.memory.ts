type AnyLoopType =
    | '_collect' | '_supply' | '_chemist'
    | '_build' | '_maintain' | '_fortify'
    | '_source' | '_mineral' | '_deposit'
    | '_feed' | '_upgrade' | '_reserve'
    | '_observe'

interface FlagMemory {
    _loop: {
        _loop_type: AnyLoopType
        _time: number
        interval: number
    }
}

interface SquadMemory extends MoveMemory {
    head_pos: RoomPosition
    target_pos: RoomPosition
    step?: PathStep
    offset_pos: number
    member: string[]
    formation: 'square' | 'snake'
}