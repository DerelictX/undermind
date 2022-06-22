import { goPerform } from "@/performer/primitive.performer"
import { collect_updater } from "@/scanner/collect"
import { consume_updater } from "@/scanner/consume"

const perfrom_flow = function(creep:Creep,fb:FlowBehavior){
    if(creep.store.getFreeCapacity() && fb.collect.length){
        const ret = goPerform(creep,fb.collect[0])
        if(ret != OK) fb.collect.shift()
        return
    }
    fb.collect = []
    if(creep.store.getUsedCapacity() && fb.consume.length){
        const ret = goPerform(creep,fb.consume[0])
        if(ret != OK) fb.consume.shift()
        return
    }
    fb.consume = []
    get_flow(creep,fb)
}

const get_flow = function(creep:Creep,fb:FlowBehavior){
    for(let flow of fb.priority){
        const room_mem = Memory.rooms[fb.fromRoom]
        if(!room_mem) return

        if(flow[1] != "lazy"){
            let tasks = room_mem._consume[flow[1]]
            if(!tasks || !tasks.length){
                room_mem._consume[flow[1]] = consume_updater[flow[1]](creep.room)
            } else {
                fb.consume.push(tasks[0])
            }
        } else {
            if(flow[0] == "lazy") return
            let tasks = room_mem._collect[flow[0]]
            if(!tasks || !tasks.length){
                room_mem._collect[flow[0]] = collect_updater[flow[0]](creep.room)
            } else {
                fb.collect.push(tasks[0])
            }
        }
    }
}

type GeneralistRole =
    |"HS0"|"HS1"|"HS2"|"HM"|"Up"
    |"HD"|"Bu"|"Ma"|"Co"|"Su"|"Ch"

const priority: {[role in GeneralistRole]:ResFlow[]} = {    
    HS0:    [['H_src0','T_src0']],
    HS1:    [['H_src1','T_src1']],
    HS2:    [['H_src2','T_src2']],
    HM:     [['H_mnrl','T_mnrl']],
    HD:     [['deposit','lazy']],

    Up: [['W_ctrl','U_ctrl']],
    Bu: [['lazy','repair'], ['lazy','anti_nuke'],['lazy','build'],  ['lazy','fortify'], ['lazy','U_ctrl']],
    Ma: [['lazy','repair'], ['lazy','T_ext'],['lazy','downgraded'], ['lazy','decayed'], ['lazy','U_ctrl']],

    Co: [['lazy','T_ctrl'], ['W_srcs','lazy'],  ['sweep','lazy'],   ['loot','lazy']],
    Su: [['lazy','T_ext'],  ['lazy','T_tower'], ['lazy','T_ctrl'],  ['lazy','T_power']],
    Ch: [['lazy','T_boost'],['lazy','T_react'], ['compound','lazy'],['W_mnrl','lazy']]
}

type ResFlow = [
    from:   'lazy' | keyof CollectTaskPool,
    to:     'lazy' | keyof ConsumeTaskPool]

interface FlowBehavior {
    fromRoom:   string
    toRoom:     string
    priority:   ResFlow[]
    collect:    ActionDescript<CollectAction&TargetedAction>[]
    consume:    ActionDescript<ConsumeAction&TargetedAction>[]
}