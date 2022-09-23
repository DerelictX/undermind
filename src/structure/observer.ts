import { spawn_loop } from "@/room/handler.spawn"
import { _format_room } from "@/room/memory.inspector"

export const observer_run = function(room: Room){
    if(room.memory._typed._type != 'owned') return
    const config = room.memory._typed._struct.observer
    if(!config.observing){
        const observer = config.ob_id ? Game.getObjectById(config.ob_id) : null
        config.observing = config.BFS_open.shift()
        if(observer && config.observing){
            const ret = observer.observeRoom(config.observing)
        }
        return
    }

    const curr =  config.observing
    config.observing = null
    const curr_node = Memory._closest_owned[curr]
    const curr_room = Game.rooms[curr]
    if(!curr_node || !curr_room) return

    const controller = curr_room.controller
    if(controller){
        //开外矿
        if(Game.shard.name != 'shard3' && !Memory.rooms[curr]
                && !controller.owner && curr_node.dist == 1){
            _format_room(curr,'reserved',room.name)
            spawn_loop(curr_room)
        }
        //别人的房
        if(controller.owner && !controller.my) {
            Memory.threat_level[curr] = controller.level
            return
        }
    } else {
        //挖过道
        const isHighway = curr.indexOf('0') != -1
        if(isHighway && !Memory.rooms[curr]) {
            _format_room(curr,'highway',room.name)
            spawn_loop(curr_room)
        }
        if(!isHighway){
            const core: StructureInvaderCore[] = room.find(FIND_HOSTILE_STRUCTURES,{
                filter: (structure) => structure.structureType == 'invaderCore'
            })
            if(core[0]){
                Memory.threat_level[curr] = core[0].level
                return
            }
        }
    }

    if(curr_node.dist >= 4) return
    const exits = Game.map.describeExits(curr)
    let exit: ExitKey
    for(exit in exits){
        const next = exits[exit]
        if(!next) continue
        const next_node = Memory._closest_owned[next]
        if(next_node && Game.time < next_node.time + 2000){
            if(next_node.root != room.name && curr_node.dist + 1 >= next_node.dist)
                continue
            if(next_node.root == room.name && curr_node.dist + 1 != next_node.dist)
                continue
        }
        Memory._closest_owned[next] = {
            root:   room.name,
            prev:   curr,
            dist:   curr_node.dist + 1,
            time:   Game.time
        }
        config.BFS_open.push(next)
    }
}