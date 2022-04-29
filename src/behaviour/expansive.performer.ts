
type LoopBehavior = {
    bhvr_name: "loop"
    reset_time: number
    interval: number
    sub_tasks: AnyBehavior[]
}

const perform_loop = function(creep: Creep, behavior:LoopBehavior) {
    if(Game.time < behavior.reset_time)
        return
    behavior.reset_time = Game.time + behavior.interval
}