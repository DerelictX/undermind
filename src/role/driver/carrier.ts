import {approach} from "@/move/action.virtual"
import {carry_priority} from "@/role/initializer/config.behavior"
import {update_col_cache} from "@/scanner/collect"
import {update_con_cache} from "@/scanner/consume"
import {action_range, parse_posed_task, perform_callback, TASK_DOING} from "@/performer/behavior.callback"

export const run_carrier = function (creep: Creep, fb: CarrierMemory) {
    if (fb.state == 'idle') {
        delete creep.memory._move
        if (creep.store.getUsedCapacity()) {
            lazy_restock(creep, fb)
            fb.state = 'consume'
        } else {
            const flow = change_flow(fb)
            if (!flow) return
            fb.find_col = flow[0]
            fb.find_con = flow[1]
            fb.state = 'collect'
        }
    }
    if (fb.state == 'collect') {
        fb.state = run_carrier_collect(creep, fb)
        if (fb.state == 'idle') {
            if (creep.store.getUsedCapacity()) {
                lazy_restock(creep, fb)
                fb.state = 'consume'
            } else {
                const flow = change_flow(fb)
                if (!flow) return
                fb.find_col = flow[0]
                fb.find_con = flow[1]
                fb.state = 'collect'
            }
        }
        if (fb.state == 'consume') {
            fb.state = run_carrier_consume(creep, fb)
        }
    } else if (fb.state == 'consume') {
        fb.state = run_carrier_consume(creep, fb)
        if (fb.state == 'idle') {
            if (creep.store.getUsedCapacity()) {
                lazy_restock(creep, fb)
                fb.state = 'consume'
            } else {
                const flow = change_flow(fb)
                if (!flow) return
                fb.find_col = flow[0]
                fb.find_con = flow[1]
                fb.state = 'collect'
            }
        }
        if (fb.state == 'collect') {
            fb.state = run_carrier_collect(creep, fb)
        }
    }
}

const run_carrier_collect = function (creep: Creep, fb: CarrierMemory) {
    if (!fb.collect.length) {
        if (creep.store.getFreeCapacity('energy') == 0) {
            return 'consume'
        }
        if (fb.find_col == 'storage') {
            if (!fb.consume.length)
                find_consume(creep, fb)
            lazy_storage(fb)
        } else find_collect(creep, fb)
        if (!fb.collect.length) {
            return 'idle'
        }
    }
    const ret = perform_callback(creep, fb.collect[0])
    if (ret != TASK_DOING) {
        fb.collect.shift()
        if (!fb.collect.length) {
            return 'consume'
        }
    }
    return 'collect'
}

const run_carrier_consume = function (creep: Creep, fb: CarrierMemory) {
    if (!fb.consume.length) {
        if (creep.store.getUsedCapacity('energy') == 0) {
            return 'idle'
        }
        if (fb.find_con == 'storage')
            lazy_restock(creep, fb)
        else find_consume(creep, fb)
        if (!fb.consume.length) {
            return 'idle'
        }
    }
    const ret = perform_callback(creep, fb.consume[0])
    if (ret != TASK_DOING) {
        fb.consume.shift()
        if (fb.consume.length) {
            approach(creep, fb.consume[0].pos, action_range[fb.consume[0].action])
        } else if (creep.store.getUsedCapacity('energy') == 0) {
            return 'idle'
        }
    }
    return 'consume'
}

const change_flow = function (fb: CarrierMemory) {
    const col_pool = global._collect[fb.fromRoom] ?? (global._collect[fb.fromRoom] = {})
    const con_pool = global._consume[fb.fromRoom] ?? (global._consume[fb.fromRoom] = {})
    const fromRoom = Game.rooms[fb.fromRoom]
    const toRoom = Game.rooms[fb.toRoom]
    for (let flow of carry_priority[fb.priority]) {
        if (flow[0] != 'storage' && !col_pool[flow[0]]?.length) {
            if (!fromRoom) return null
            update_col_cache(col_pool, flow[0], fromRoom)
        }
        if (flow[0] != 'storage' && !col_pool[flow[0]]?.length) {
            continue
        }
        if (flow[1] != 'storage' && !con_pool[flow[1]]?.length) {
            if (!toRoom) return null
            update_con_cache(con_pool, flow[1], fromRoom)
        }
        if (flow[1] != 'storage' && !con_pool[flow[1]]?.length) {
            continue
        }
        //console.log('\t' + flow)
        return flow
    }
    return null
}

const find_consume = function (creep: Creep, fb: CarrierMemory) {
    const consume = global._consume[fb.toRoom] ?? (global._consume[fb.toRoom] = {})
    if (fb.find_con == 'storage') return
    let free = creep.store.getCapacity()
    const pool = consume[fb.find_con]
    while (pool && pool.length && free > 0) {
        const task = pool[0]
        if (task.action == 'transfer' && task.args[2]) {
            if (free < task.args[2]) {
                task.args[2] -= free
                fb.consume.push(parse_posed_task({
                    action: 'transfer',
                    args: [task.args[0], task.args[1]],
                    pos: task.pos
                }))
                break
            } else {
                free -= task.args[2]
                fb.consume.push(parse_posed_task(task))
                pool.shift()
            }
        } else {
            fb.consume.push(parse_posed_task(task))
            pool.shift()
            break
        }
    }
}

const find_collect = function (creep: Creep, fb: CarrierMemory) {
    const collect = global._collect[fb.fromRoom] ?? (global._collect[fb.fromRoom] = {})
    if (fb.find_col == 'storage') return
    let free = creep.store.getCapacity()
    if (!collect[fb.find_col]?.length) {
        const fromRoom = Game.rooms[fb.fromRoom]
        if (fromRoom) {
            update_col_cache(collect, fb.find_col, fromRoom)
        }
    }

    const pool = collect[fb.find_col]
    while (pool && pool.length && free > 0) {
        const task = pool[0]
        //console.log('\t' + JSON.stringify(task))
        if (task.action == 'withdraw' && task.args[2]) {
            if (free < task.args[2]) {
                task.args[2] -= free
                fb.collect.push(parse_posed_task({
                    action: 'withdraw',
                    args: [task.args[0], task.args[1]],
                    pos: task.pos
                }))
                break
            } else {
                free -= task.args[2]
                fb.collect.push(parse_posed_task(task))
                pool.shift()
            }
        } else {
            fb.collect.push(parse_posed_task(task))
            pool.shift()
            break
        }
    }
}

/**
 * 生成将creep.store中所有的资源送回storage的任务
 * @param creep
 * @param fb
 * @returns
 */
const lazy_restock = function (creep: Creep, fb: CarrierMemory) {
    const toRoom = Game.rooms[fb.toRoom]
    if (!toRoom) return
    let storage: AnyStoreStructure | undefined = toRoom.storage
    if (!storage || !storage.my || storage.store.getFreeCapacity() < 50000)
        storage = toRoom.terminal
    if (!storage || !storage.my || storage.store.getFreeCapacity() < 50000)
        return

    const store: StorePropertiesOnly = creep.store;
    let resourceType: keyof typeof store;
    for (resourceType in store) {   //遍历资源
        fb.consume.push(parse_posed_task({
            pos: storage.pos,
            action: 'transfer',
            args: [storage.id, resourceType]
        }))
    }
}

/**
 * 根据已获取的供应任务，生成从storage取对应资源的任务
 * @param fb
 * @returns
 */
const lazy_storage = function (fb: CarrierMemory) {
    const storage = Game.rooms[fb.fromRoom]?.storage
    const terminal = Game.rooms[fb.fromRoom]?.terminal
    if (!storage) return
    for (let consume of fb.consume) { //遍历供应任务
        let collect: PosedCreepTask<'withdraw'> = {
            pos: storage.pos,
            action: 'withdraw',
            args: [storage.id, 'energy']
        }
        if (consume.action == 'transfer') {
            collect.args = [storage.id, consume.args[1], consume.args[2]]
        }

        if (!storage.store[collect.args[1]]) {
            if (terminal?.store[collect.args[1]]) {
                collect.args[0] = terminal?.id
                collect.pos = terminal.pos
            } else {
                continue
            }
        }

        //合并目标相同，资源类型相同的withdraw任务
        const last_collect = fb.collect[fb.collect.length - 1]
        if (last_collect && last_collect.action == 'withdraw'
            && last_collect.args[0] == collect.args[0]
            && last_collect.args[1] == collect.args[1]) {
            last_collect.args[2] = (last_collect.args[2] && collect.args[2])
                ? (last_collect.args[2] + collect.args[2]) : undefined
        } else fb.collect.push(parse_posed_task(collect))   //不合并
    }
}