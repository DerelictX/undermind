type RoomTraverse = (x: number, y: number, value: number) => void

export function exec(matrix: CostMatrix, x: number, y: number, value: number) {
    let tmp = matrix.get(x, y)
    matrix.set(x, y, value);
    return tmp
}

export function forEach(matrix: CostMatrix, func: RoomTraverse) {
    for (let y = 0; y < 50; y++) {
        for (let x = 0; x < 50; x++) {
            func(x, y, matrix.get(x, y))
        }
    }
}

export function for4Direction(matrix: CostMatrix, func: RoomTraverse, x: number, y: number, range = 1) {
    for (let e of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        let xt = x + e[0]
        let yt = y + e[1]
        if (xt >= 0 && yt >= 0 && xt <= 49 && yt <= 49)
            func(xt, yt, matrix.get(xt, yt))
    }
}

export function forNear(matrix: CostMatrix, func: RoomTraverse, x: number, y: number, range = 1) {
    for (let i = -range; i <= range; i++) {
        for (let j = -range; j <= range; j++) {
            let xt = x + i
            let yt = y + j
            if ((i || j) && xt >= 0 && yt >= 0 && xt <= 49 && yt <= 49)
                func(xt, yt, matrix.get(xt, yt))
        }
    }
}

export function forBorder(matrix: CostMatrix, func: RoomTraverse, range = 1) {
    for (let y = 0; y < 50; y++) {
        func(0, y, matrix.get(0, y))
        func(49, y, matrix.get(49, y))
    }
    for (let x = 1; x < 49; x++) {
        func(x, 0, matrix.get(x, 0))
        func(x, 49, matrix.get(x, 49))
    }
}

export function initRoomTerrainWalkAble(matrix: CostMatrix, roomName: string) {
    let terrain = new Room.Terrain(roomName);
    forEach(matrix, (x: number, y: number) => {
        matrix.set(x, y, terrain.get(x, y) == 1 ? 0 : terrain.get(x, y) == 0 ? 1 : 2)
    })
}
