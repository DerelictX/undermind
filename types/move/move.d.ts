interface MoveMemory {
    _move?: {
        dest: { x: number, y: number, room: string },
        time: number,
        path: string,
        room: string
    }
    _hike?: {
        from: string
        to: string
        route: {
            exit: ExitConstant
            room: string
            exitPos?: RoomPosition
        }[]
    }
}

type RoomMoveIntents = {
    [pos: string]: {
        id: Id<AnyCreep>
        step: (0 | DirectionConstant)[]
    }
}