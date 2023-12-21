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