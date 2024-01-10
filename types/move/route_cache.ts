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
