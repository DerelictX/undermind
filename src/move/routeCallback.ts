export const routeCallback = function (roomName: string): number {
    if (Memory.threat_level[roomName]) return Infinity
    let isHighway = roomName.indexOf('0') != -1
    const room: Room | undefined = Game.rooms[roomName]
    let isMyRoom = room && room.controller && room.controller.my
    if (isHighway || isMyRoom) {
        return 1;
    } else {
        return 2.5;
    }
}

export const update_exit = function (roomName: string) {
    if (!Memory._edge_exits[roomName])
        Memory._edge_exits[roomName] = {}
    const _route = Memory._edge_exits[roomName]
    if (!_route) return

    const terrain = Game.map.getRoomTerrain(roomName)
    const exitRoom = Game.map.describeExits(roomName)
    if (exitRoom[TOP]) {
        _route[exitRoom[TOP]] = []
        for (let x = 1; x <= 48; x++) {
            if (!terrain.get(x, 0) && (terrain.get(x - 1, 0) || terrain.get(x + 1, 0))) {
                const pos = new RoomPosition(x, 0, roomName)
                _route[exitRoom[TOP]].push(pos)
            }
        }
    }
    if (exitRoom[RIGHT]) {
        _route[exitRoom[RIGHT]] = []
        for (let y = 1; y <= 48; y++) {
            if (!terrain.get(49, y) && (terrain.get(49, y - 1) || terrain.get(49, y + 1))) {
                const pos = new RoomPosition(49, y, roomName)
                _route[exitRoom[RIGHT]].push(pos)
            }
        }
    }
    if (exitRoom[BOTTOM]) {
        _route[exitRoom[BOTTOM]] = []
        for (let x = 1; x <= 48; x++) {
            if (!terrain.get(x, 49) && (terrain.get(x - 1, 49) || terrain.get(x + 1, 49))) {
                const pos = new RoomPosition(x, 49, roomName)
                _route[exitRoom[BOTTOM]].push(pos)
            }
        }
    }
    if (exitRoom[LEFT]) {
        _route[exitRoom[LEFT]] = []
        for (let y = 1; y <= 48; y++) {
            if (!terrain.get(0, y) && (terrain.get(0, y - 1) || terrain.get(0, y + 1))) {
                const pos = new RoomPosition(0, y, roomName)
                _route[exitRoom[LEFT]].push(pos)
            }
        }
    }
}
