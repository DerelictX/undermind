import { collect_updater } from "@/scanner/collect"
import { consume_updater } from "@/scanner/consume"
import { TASK_COMPLETE, TASK_DOING, TASK_FAILED } from "./behavior.any"
import { perform_callback } from "./behavior.callback"

export const perfrom_flow = function(creep:Creep,fb:FlowBehavior){
    console.log(creep.name)
    if(fb.state == 'idle'){
        const flow = change_flow(fb)
        if(!flow) return TASK_DOING
        fb.current = flow
        fb.state = 'collect'
        return TASK_COMPLETE
    }
    if(fb.state == 'collect'){
        if(!fb.collect.length){
            find_collect(creep,fb)
            if(!fb.collect.length) {
                fb.state = 'idle'
                return TASK_COMPLETE
            }
        }
        const ret = perform_callback(creep,fb.collect[0])
        if(ret != TASK_DOING) fb.collect.shift()
        if(ret == TASK_FAILED){
            fb.state = 'consume'
            return TASK_DOING
        }
        return TASK_DOING
    }
    if(fb.state == 'consume'){
        if(!fb.consume.length) {
            find_consume(creep,fb)
            if(!fb.consume.length) {
                fb.state = 'idle'
                return TASK_COMPLETE
            }
        }
        const ret = perform_callback(creep,fb.consume[0])
        if(ret != TASK_DOING) fb.consume.shift()
        if(ret == TASK_FAILED){
            fb.state = 'collect'
            return TASK_DOING
        }
        return TASK_DOING
    }
    return TASK_FAILED
}

const change_flow = function(fb:FlowBehavior) {
    const collect = Memory.rooms[fb.fromRoom]._collect
    const consume = Memory.rooms[fb.toRoom]._consume
    for(let flow of fb.priority){
        if(flow[0] != 'lazy' && !collect[flow[0]]?.length) {
            collect[flow[0]] = collect_updater[flow[0]](Game.rooms[fb.fromRoom])
        }
        if(flow[0] != 'lazy' && !collect[flow[0]]?.length) {
            continue
        }
        if(flow[1] != 'lazy' && !consume[flow[1]]?.length) {
            consume[flow[1]] = consume_updater[flow[1]](Game.rooms[fb.toRoom])
        }
        if(flow[1] != 'lazy' && !consume[flow[1]]?.length) {
            continue
        }
        console.log('\t' + flow)
        return flow
    }
    return null
}

const find_consume = function(creep:Creep,fb:FlowBehavior){
    const consume = Memory.rooms[fb.toRoom]._consume
    if(fb.current[1] == 'lazy'){
        lazy_restock(creep,fb)
        return
    }
    let free = creep.store.getCapacity()
    const pool = consume[fb.current[1]]
    while(pool && pool.length && free > 0) {
        const task = pool[0]
        console.log('\t' + JSON.stringify(task))
        if(task.action == 'transfer' && task.args[2]){
            if(free < task.args[2]){
                task.args[2] -= free
                fb.consume.push(parse_posed_task({
                    action:'transfer',
                    args:   [task.args[0],task.args[1]],
                    pos:    task.pos
                }))
                break
            }else{
                free -= task.args[2]
                fb.consume.push(parse_posed_task(task))
                pool.shift()
            }
        }
        else if(task.action == 'generateSafeMode'){
            if(free < 1000){
                break
            }else{
                free -= 1000
                fb.consume.push(parse_posed_task(task))
                pool.shift()
            }
        }
        else {
            fb.consume.push(parse_posed_task(task))
            pool.shift()
            break
        }
    }
}

const find_collect = function(creep:Creep,fb:FlowBehavior){
    const collect = Memory.rooms[fb.fromRoom]._collect
    if(fb.current[0] == 'lazy'){
        if(!fb.consume.length)
            find_consume(creep,fb)
        lazy_storage(fb)
        return
    }
    let free = creep.store.getCapacity()
    const pool = collect[fb.current[0]]
    while(pool && pool.length && free > 0) {
        const task = pool[0]
        console.log('\t' + JSON.stringify(task))
        if(task.action == 'withdraw' && task.args[2]){
            if(free < task.args[2]){
                task.args[2] -= free
                fb.collect.push(parse_posed_task({
                    action:'withdraw',
                    args:   [task.args[0],task.args[1]],
                    pos:    task.pos
                }))
                break
            }
            else{
                free -= task.args[2]
                fb.collect.push(parse_posed_task(task))
                pool.shift()
            }
        }
        else {
            fb.collect.push(parse_posed_task(task))
            pool.shift()
            break
        }
    }
}

const lazy_restock = function(creep:Creep,fb:FlowBehavior) {
    const toRoom = Game.rooms[fb.toRoom]
    if(!toRoom) return
    let storage:AnyStoreStructure|undefined = toRoom.storage
    if(!storage || !storage.my || storage.store.getFreeCapacity() < 100000)
        storage = toRoom.terminal
    if(!storage || !storage.my || storage.store.getFreeCapacity() < 50000)
        return

    var store: StorePropertiesOnly = creep.store
    var resourceType: keyof typeof store
    for (resourceType in store) {
        fb.consume.push(parse_posed_task({
            pos: storage.pos,
            action: 'transfer',
            args: [storage.id, resourceType]
        }))
    }
}

const lazy_storage = function(fb:FlowBehavior) {
    const storage = Game.rooms[fb.fromRoom].storage
    if(!storage) return
    for(let consume of fb.consume){
        let collect: PosedCreepTask<'withdraw'> = {
            pos:    storage.pos,
            action: 'withdraw',
            args:   [storage.id,'energy']
        }
        if(consume.action == 'generateSafeMode')
            collect.args = [storage.id,'G',1000]
        else if(consume.action == 'transfer')
            collect.args = [storage.id,consume.args[1],consume.args[2]]

        const last_collect = fb.collect[fb.collect.length - 1]
        if(last_collect && last_collect.action == 'withdraw'
                && last_collect.args[0] == collect.args[0]
                && last_collect.args[1] == collect.args[1]) {
            last_collect.args[2] = (last_collect.args[2] && collect.args[2])
                ? (last_collect.args[2] + collect.args[2]) : undefined
        } else fb.collect.push(parse_posed_task(collect))
    }
}

const parse_posed_task = function(posed:PosedCreepTask<TargetedAction>):CallbackBehavior<TargetedAction>{
    const root: CallbackBehavior<TargetedAction> = {...{bhvr_name:'callbackful'},...posed}
    switch(root.action){
        case 'withdraw':
        case 'transfer':
        case 'pickup':
            root[OK] = TASK_COMPLETE
            break
        case 'harvest':
            root[ERR_TIRED] = TASK_DOING
        case 'dismantle':
            root[OK] = {...{bhvr_name:'callbackful'},...{action:"prejudge_full",args:[0]}}
            break
        case 'build':
            root[ERR_NOT_FOUND] = TASK_COMPLETE
            break
        case 'repair':
            root[OK] = {...{bhvr_name:'callbackful'},...{action:"full_hits",args:[root.args[0],0]}}
            break
    }
    const move: CallbackBehavior<'approach'> = {...{bhvr_name:'callbackful'},
            ...{action:"approach",args:[posed.pos,1]}}
    move[ERR_TIRED] = TASK_DOING
    root[ERR_NOT_IN_RANGE] = move
    return root
}