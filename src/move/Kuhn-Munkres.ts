/**二分图最大匹配 */
const asdf = function(intents: RoomMoveIntents){
    const matchedFrom: Record<string,string> = {}
    const matchedTo: Record<string,string> = {}
    for(const fromPos in intents){
        const visited: Record<string,boolean> = {}
        const pred: Record<string,string> = {}
        const queue = [fromPos]

        while(true){
            const from = queue.shift()
            if(!from) return false
            const x = base64decode(from[0])
            const y = base64decode(from[1])

            for(let dir of intents[from].step){
                const offset = offsetsByDirection[dir]
                let to = base64table[x + offset[0]] + base64table[y + offset[1]]

                if(visited[to]) continue
                visited[to] = true
                pred[to] = from

                if(!matchedFrom[to]){
                    while(to){
                        const temp = matchedTo[pred[to]]
                        matchedTo[pred[to]] = to
                        matchedFrom[to] = pred[to]
                        to = temp
                    }
                    return true
                } else queue.push(matchedFrom[to])
            }
        }
    }
    return false
}

const qwer = function(intents: RoomMoveIntents){
    for(const fromPos in intents){
        const creep = Game.getObjectById(intents[fromPos].id)
        if(!creep?.room) return
        const pos = creep.pos
        const pos_str = pos.x + ',' + pos.y
    }
}

const zxcv = function(){
    for(let name in Game.creeps){
        const creep = Game.creeps[name]
        const _move_intents = Memory._move_intents[creep.room.name]
            ?? (Memory._move_intents[creep.room.name] = {})
        const pos_str = creep.pos.x + ',' + creep.pos.y
        _move_intents[pos_str] ?? (_move_intents[pos_str] = {id: creep.id, step: []})
    }
    for(let name in Game.powerCreeps){
        const powerCreep = Game.powerCreeps[name]
        if(!powerCreep.room) return
        const _move_intents = Memory._move_intents[powerCreep.room.name]
            ?? (Memory._move_intents[powerCreep.room.name] = {})
        const pos_str = powerCreep.pos.x + ',' + powerCreep.pos.y
        _move_intents[pos_str] ?? (_move_intents[pos_str] = {id: powerCreep.id, step: []})
    }
}

const offsetsByDirection:{[dir in 0 | DirectionConstant]: [number,number]} = [
    [0,0], [0,-1], [1,-1], [1,0], [1,1], [0,1], [-1,1], [-1,0], [-1,-1]
]

const base64table = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', '0', '1', '2', '3',
    '4', '5', '6', '7', '8', '9', '+', '/'
]

const base64decode = function(char:string): number{
    char = char[0]
    const code = char.charCodeAt(0)
    if(char >= 'A' && char <= 'Z')
        return code - 65
    if(char >= 'a' && char <= 'z')
        return code - 71
    if(char == '+') return 62
    if(char == '/') return 63
    return code + 4
}

const reverse_dir: {[dir in DirectionConstant]: DirectionConstant} = {
    1: 5,
    2: 6,
    3: 7,
    4: 8,
    5: 1,
    6: 2,
    7: 3,
    8: 4
}

const adjace_dir: {[dir in 0|DirectionConstant]: 0|DirectionConstant[]} = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: []
}