export const observer_run = function (room: Room) {
    const config = room.memory.observer
    if (!config) return

    if (!config.observing) {
        const observer = config.ob_id ? Game.getObjectById(config.ob_id) : null
        config.observing = config.BFS_open.shift()
        if (observer && config.observing) {
            observer.observeRoom(config.observing)
        }
        return
    }

    const curr = config.observing
    config.observing = null
    const curr_node = Memory._closest_owned[curr]
    const curr_room = Game.rooms[curr]
    if (!curr_room || !curr_node) return

    handle_unowned(curr_room, curr_node)
    if (Memory.threat_level[curr]) return
    if (curr_node.dist >= 4) return

    const exits = Game.map.describeExits(curr)
    let exit: ExitKey
    for (exit in exits) {
        const next = exits[exit]
        if (!next) continue
        const next_node = Memory._closest_owned[next]
        if (!next_node
            || (next_node.root == room.name && next_node.time < config.start_time)
            || (next_node.root != room.name && curr_node.dist + 1 < next_node.dist)) {
            Memory._closest_owned[next] = {
                root: room.name,
                prev: curr,
                dist: curr_node.dist + 1,
                time: Game.time
            }
            config.BFS_open.push(next)
        }
    }
}

function handle_unowned(curr_room: Room, curr_node: RouteNode) {
    const curr = curr_room.name
    const controller = curr_room.controller
    Memory.threat_level[curr] = 0
    if (controller) {
        //开外矿
        if (Game.shard.name != 'shard3' && !Memory.rooms[curr]
            && !controller.owner && curr_node.dist == 1) {
            //
        }
        //别人的房
        if (controller.owner && !controller.my) {
            Memory.threat_level[curr] = controller.level
        }
    } else {
        //挖过道
        const isHighway = curr.indexOf('0') != -1
        if (isHighway && !Memory.rooms[curr]) {
            //
        }
        const core: StructureInvaderCore[] = curr_room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == 'invaderCore'
        })
        if (core[0]) {
            Memory.threat_level[curr] = core[0].level
        }
    }
}