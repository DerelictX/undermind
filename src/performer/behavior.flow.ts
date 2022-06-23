import { collect_updater } from "@/scanner/collect"
import { consume_updater } from "@/scanner/consume"
import { TASK_DOING } from "./behavior.any"
import { goPerform } from "./action.primitive"

export const perfrom_flow = function(creep:Creep,fb:FlowBehavior){
    if(creep.store.getFreeCapacity() && fb.collect.length){
        const ret = goPerform(creep,fb.collect[0])
        if(ret != OK) fb.collect.shift()
        return TASK_DOING
    }
    fb.collect = []
    if(creep.store.getUsedCapacity() && fb.consume.length){
        const ret = goPerform(creep,fb.consume[0])
        if(ret != OK) fb.consume.shift()
        return TASK_DOING
    }
    fb.consume = []
    get_flow(creep,fb)
    return TASK_DOING
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
