type ComboBehavior = "serial"|"parallel"

type SerialBehavior = {
    bhvr_name: "serial"
    sub_tasks: (ActionDescript<PrimitiveBehavior>|ParallelBehavior)[]
}
type ParallelBehavior = {
    bhvr_name: "parallel"
    sub_tasks: (ActionDescript<PrimitiveBehavior>|SerialBehavior)[]
}

const combinator: {[combo in ComboBehavior]:any} = {
    serial(creep:Creep, sub_task: (ActionDescript<PrimitiveBehavior>|ParallelBehavior)[]){
        const behavior = sub_task[0]
        if(behavior.bhvr_name != 'parallel')
            perform(creep,behavior)
    },
    parallel(creep:Creep, sub_task: (ActionDescript<PrimitiveBehavior>|SerialBehavior)[]){
        for(let behavior of sub_task){
            if(behavior.bhvr_name != 'serial')
            perform(creep,behavior)
        }
    },
}

const condition = {
    range0:(creep:Creep,target:RoomPosition|{pos:RoomPosition})=>creep.pos.isEqualTo(target),
    range1:(creep:Creep,target:RoomPosition|{pos:RoomPosition})=>creep.pos.isNearTo(target),
    range3:(creep:Creep,target:RoomPosition|{pos:RoomPosition})=>creep.pos.inRangeTo(target,3),
}