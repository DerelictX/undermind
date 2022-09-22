interface Memory extends PathMemory {
    username:   string
    creep_SN:   number
    terminal:   {
        supply: {[res in ResourceConstant] ?: {[room: string]: boolean}}
        demand: {[res in ResourceConstant] ?: {[room: string]: boolean}}
    }
}

interface PathMemory {
    _move_intents:  {[room:string] : undefined | RoomMoveIntents}

    commonMatrix:   {[room:string] : undefined | number[]}
    squardMatrix:   {[room:string] : undefined | number[]}

    _edge_exits:    {[room:string] : undefined | {
        [toRoom: string]: RoomPosition[]
    }}
    _closest_owned: {[room:string] : undefined | {
        root:   string
        prev:   string
        dist:   number
        time:   number
    }}
}

type RoomMoveIntents = {
    [pos:string]:{
        id:     Id<AnyCreep>
        step:   (0 | DirectionConstant)[]
    }
}