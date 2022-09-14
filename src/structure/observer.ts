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
    if(!curr_node || !curr_room || curr_node.dist >= 4) return

    if(curr_room.controller){
        //开外矿
        if(!curr_room.controller.owner && curr_node.dist == 1 && !Memory.rooms[curr]){
            _format_room(curr,'reserved',room.name)
            spawn_loop(curr_room)   //房间第一次定时任务
        }
        //别人的房
        if(curr_room.controller.owner && !curr_room.controller.my) return
    }

    const exits = Game.map.describeExits(curr)
    let exit: ExitKey
    for(exit in exits){
        const next = exits[exit]
        if(!next) continue
        const next_node = Memory._closest_owned[next]
        if(next_node && Game.time < next_node.time + 2000){
            if(curr_node.dist + 1 >= next_node.dist)
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