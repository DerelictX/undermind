interface RouteNode {
    prev: string
    dist: number
    time: number
}

interface PathMemory {
    _edge_exits: RoomRecord<{
        [toRoom: string]: RoomPosition[]
    }>
    _near_owned: RoomRecord<RoomRecord<RouteNode>>
    threat_level: RoomRecord<number>
}
