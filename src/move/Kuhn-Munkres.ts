import {autoRoadCallback} from "./roomCallback"

/**
 * 统一处理creep的移动意图，需要在所有creep的活动之后调用
 */
export const handle_moves = function () {
    for (let name in Game.creeps) {
        const creep = Game.creeps[name]
        if (!creep.spawning) idle_move(creep)
    }
    for (let name in Game.powerCreeps) {
        const creep = Game.powerCreeps[name]
        if (creep.room) idle_move(creep)
    }
    for (let name in Game.rooms) {
        const _move_intents = global._move_intents[name]
        if (!_move_intents) continue
        const matrix = autoRoadCallback(name)
        if (!matrix) continue
        const room = Game.rooms[name]
        Kuhn_Munkres(_move_intents, matrix, Game.map.getRoomTerrain(name), room.visual)
    }
}

/**
 * 二分图最大匹配
 * @param intents   所有creep的移动意图汇总
 * @param matrix    用于判断可以让位的位置
 * @param terrain   用于判断可以让位的位置
 * @param visual    移动step可视化
 * @constructor
 */
const Kuhn_Munkres = function (intents: RoomMoveIntents,
                               matrix: CostMatrix, terrain: RoomTerrain, visual: RoomVisual) {
    const matchedFrom: Record<string, string> = {}
    const matchedTo: Record<string, string> = {}
    for (const fromPos in intents) {
        const visited: Record<string, boolean> = {}
        const pred: Record<string, string> = {}
        const queue = [fromPos]

        BFS:    while (true) {
            const from = queue.shift()
            if (!from) break;
            const x = base64decode(from[0])
            const y = base64decode(from[1])

            if (!intents[from].step) {
                visual.circle(x, y, {radius: 0.5})
                continue
            }
            for (let dir of intents[from].step) {
                const offset = offsetsByDirection[dir]
                const xx = x + offset[0]
                const yy = y + offset[1]
                /**无法行走的位置 */
                if (matrix.get(xx, yy) >= 0xff) continue
                if (terrain.get(xx, yy) == TERRAIN_MASK_WALL) continue
                visual.line(xx, yy, x, y, {color: '#0000FF'})
                let to = base64table[xx] + base64table[yy]
                /**节点已访问 */
                if (visited[to]) continue
                visited[to] = true
                pred[to] = from

                if (!matchedFrom[to]) {
                    while (to) {
                        const temp = matchedTo[pred[to]]
                        matchedTo[pred[to]] = to
                        matchedFrom[to] = pred[to]
                        to = temp
                    }
                    break BFS
                } else queue.push(matchedFrom[to])
            }
        }
    }

    /**根据匹配结构移动creep */
    for (const from in intents) {
        const creep = Game.getObjectById(intents[from].id)
        if (!creep) continue
        let to = matchedTo[from]
        if (!to) {
            /**无法往旁边让位，对穿 */
            creep.say('swap')
            to = matchedFrom[from]
        }
        if (!to) {
            creep.say('blocked')
            continue
        }
        const x = base64decode(to[0])
        const y = base64decode(to[1])
        visual.line(creep.pos.x, creep.pos.y, x, y, {color: '#FF7F00'})
        const dir = creep.pos.getDirectionTo(x, y)
        if (dir) creep.move(dir)
    }
}

/**没有移动计划，可以给别的爬让路 */
const idle_move = function (creep: AnyCreep) {
    const pos = creep.pos
    const _move_intents = global._move_intents[pos.roomName]
        ?? (global._move_intents[pos.roomName] = {})
    const pos_str = base64table[pos.x] + base64table[pos.y]
    if (_move_intents[pos_str]) return
    _move_intents[pos_str] = {id: creep.id, step: adjacent_dir[0]}
}

const offsetsByDirection: { [dir in 0 | DirectionConstant]: [number, number] } = [
    [0, 0], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]
]

export const base64table = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', '0', '1', '2', '3',
    '4', '5', '6', '7', '8', '9', '+', '/'
]

const base64decode = function (char: string): number {
    char = char[0]
    const code = char.charCodeAt(0)
    if (char >= 'A' && char <= 'Z')
        return code - 65
    if (char >= 'a' && char <= 'z')
        return code - 71
    if (char == '+') return 62
    if (char == '/') return 63
    return code + 4
}

/**相邻方向 */
export const adjacent_dir: { [dir in 0 | DirectionConstant]: (0 | DirectionConstant)[] } = {
    0: [0, 1, 5, 3, 7, 2, 6, 4, 8],
    1: [0, 1, 2, 8],
    2: [0, 2, 3, 1],
    3: [0, 3, 4, 2],
    4: [0, 4, 5, 3],
    5: [0, 5, 6, 4],
    6: [0, 6, 7, 5],
    7: [0, 7, 8, 6],
    8: [0, 8, 1, 7],
}

/**反向 */
const reverse_dir: { [dir in DirectionConstant]: DirectionConstant } = {
    1: 5,
    2: 6,
    3: 7,
    4: 8,
    5: 1,
    6: 2,
    7: 3,
    8: 4
}