import { publish_spawn_task } from "@/structure/lv1_spawn"

export const loop_flags = function(){
    for(let flag_name in Memory._loop_flag){
        const _loop = Memory._loop_flag[flag_name]
        const flag = Game.flags[flag_name]
        if(!flag || !_loop) continue
        if(_loop.reload_time > Game.time) continue
        /**限定时间间隔，防止无限生爬 */
        if(_loop.interval < 200) _loop.interval = 200
        if(_loop.interval > 10000) _loop.interval = 10000
        /**重置定时器 */
        _loop.reload_time = Game.time + _loop.interval

        console.log(`_loop\t${_loop.loop_key}\t${_loop.task_type}`)
        let spawn_task: SpawnTask<FlagLoopType>|null = null
        spawn_task = handlers[_loop.task_type](flag)
        if(spawn_task){
            publish_spawn_task(spawn_task)
        }
        /**每tick只扫描一次，减少cpu负载波动 */
        return
    }
}

const handlers: {
    [T in FlagLoopType] : (flag: Flag) => SpawnTask<T>|null
} = {
    _observe: function (flag: Flag) {
        throw new Error("Function not implemented.")
    }
}