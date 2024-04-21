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
    const curr_node = Memory._near_owned[curr]?.[room.name]
    const curr_room = Game.rooms[curr]
    if (!curr_room || !curr_node) return

    handle_unowned(curr_room, curr_node)
    if (Memory.threat_level[curr] ?? 0 > 2) return
    if (curr_node.dist >= 4) return

    const exits = Game.map.describeExits(curr)
    let exit: ExitKey
    for (exit in exits) {
        const next = exits[exit]
        if (!next) continue
        const _near = Memory._near_owned[next] ?? (Memory._near_owned[next] = {})
        const next_node = _near[room.name]
        if (!next_node
            || next_node.time < config.start_time
            || next_node.dist > curr_node.dist + 1) {
            _near[room.name] = {
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
    delete Memory.threat_level[curr]
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

        }
        const core: StructureInvaderCore[] = curr_room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == 'invaderCore'
        })
        if (core[0]) {
            Memory.threat_level[curr] = core[0].level + 3
        }
    }
}