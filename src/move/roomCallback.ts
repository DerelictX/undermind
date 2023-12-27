export const autoRoadCallback = function (roomName: string) {
    const matrix = global.commonMatrix[roomName]
    if (matrix) {
        return PathFinder.CostMatrix.deserialize(matrix)
    }
    let room = Game.rooms[roomName]
    if (!room) return false
    let costs = new PathFinder.CostMatrix

    const structs: AnyStructure[] = room.find(FIND_STRUCTURES)
    structs.forEach(function (struct) {
        if (struct.structureType === STRUCTURE_ROAD) {
            costs.set(struct.pos.x, struct.pos.y, 1);
        } else if (struct.structureType !== STRUCTURE_CONTAINER
            && (struct.structureType !== STRUCTURE_RAMPART || !struct.my)) {
            costs.set(struct.pos.x, struct.pos.y, 0xff);
        }
    });
    room.find(FIND_MY_CONSTRUCTION_SITES).forEach(function (struct) {
        if (struct.structureType === STRUCTURE_ROAD) {
            costs.set(struct.pos.x, struct.pos.y, 1);
        } else if (struct.structureType !== STRUCTURE_CONTAINER
            && struct.structureType !== STRUCTURE_RAMPART) {
            costs.set(struct.pos.x, struct.pos.y, 0xff);
        }
    });

    console.log('autoRoadCallback(' + room.name + ')')
    global.commonMatrix[room.name] = costs.serialize()
    return costs;
}

export const createHarvestRoad = function (fromPos: RoomPosition, toPos: RoomPosition) {
    const path = PathFinder.search(fromPos, {pos: toPos, range: 1}, {
        plainCost: 2, swampCost: 10, maxRooms: 2,
        roomCallback: autoRoadCallback
    })
    const containerPos = path.path.pop()
    for (let pos of path.path) {
        Game.rooms[pos.roomName].createConstructionSite(pos, STRUCTURE_ROAD)
    }
    if (containerPos)
        Game.rooms[containerPos.roomName].createConstructionSite(containerPos, STRUCTURE_CONTAINER)
}