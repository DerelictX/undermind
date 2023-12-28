interface FlagMemory {
    _class: '_loop' | '_squad'
    _loop: {
        _loop_type: AnyLoopType
        reload_time: number
        interval: number
    }
    _squad: {
        head_pos: RoomPosition
        offset_head: number
        offset_pos: number
        member: Record<string, 0 | 1 | 2 | 3>
    }
}