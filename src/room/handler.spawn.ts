import { highway_room_loop_handler } from "@/room/schedule/highway"
import { owned_room_loop_handler } from "@/room/schedule/owned"
import { reserved_room_loop_handler } from "@/room/schedule/reserved"
import { claimed_room_loop_handler } from "./schedule/claimed"

/**
 * 定时任务调度程序，用于扫描房间和孵化
 * @param room 
 * @returns 
 */
export const spawn_loop = function(room: Room) {
    let loop_key: keyof typeof room.memory._typed._looper
    for(loop_key in room.memory._typed._looper){
        const spawn_loop = room.memory._typed._looper[loop_key]
        if(!spawn_loop || spawn_loop.reload_time > Game.time)
            continue
        
        /**调用扫描程序 */
        let role_impl:RoleImpl|null = null
        switch(room.memory._typed._type){
            case 'owned':
                role_impl = owned_room_loop_handler[loop_key](room,room.memory._typed._static,spawn_loop)
                break
            case 'reserved':
                role_impl = reserved_room_loop_handler[loop_key](room,room.memory._typed._static,spawn_loop)
                break
            case 'highway':
                role_impl = highway_room_loop_handler[loop_key](room,room.memory._typed._static,spawn_loop)
                break
            case 'claimed':
                role_impl = claimed_room_loop_handler[loop_key](room,room.memory._typed._static,spawn_loop)
                break
        }
        /**限定时间间隔，防止无限生爬 */
        if(spawn_loop.interval < 200) spawn_loop.interval = 200
        if(spawn_loop.interval > 10000) spawn_loop.interval = 10000
        /**重置定时器 */
        spawn_loop.reload_time = Game.time + spawn_loop.interval

        if(role_impl){
            let _spawn: SpawnTask[]
            if(room.memory._spawn == room.name){
                if(room.memory._typed._type != 'owned') return
                _spawn = room.memory._typed._struct.spawns.t1
            } else {
                /**援助爬孵化优先级更低 */
                const help = Memory.rooms[room.memory._spawn]._typed
                if(help._type != 'owned') return
                _spawn = help._struct.spawns.t2
                if(!_spawn) return
            }
            /**按获取到的role_impl生爬 */
            const caller: SpawnCaller<RoomTypes> = {
                room_name:  room.name,
                room_type:  room.memory._typed._type,
                loop_key:   loop_key
            }
            _spawn.push({...{_caller:caller},...role_impl})
        }
        /**每tick只扫描一次，减少cpu负载波动 */
        return
    }
}