import { compressed, product_tier } from "@/constant/resource_series"
import _, { ceil, floor } from "lodash"
import { demand_res } from "./terminal"

export const factory_run = function(room: Room){
    if(room.memory._typed._type != 'owned') return
    const config = room.memory._typed._struct.factory
    const factory = config.fact_id ? Game.getObjectById(config.fact_id) : null
    if(!factory || factory.cooldown) return

    if(factory.level) {
        for(let res of product_tier[factory.level]){
            if(factory.produce(res) == OK) return
        }
    }
    for(let res of product_tier[0]){
        if(factory.produce(res) == OK) return
    }
    for(let res of compressed){
        if(factory.store[res] > 2000) continue
        if(factory.produce(res) == OK) return
    }
}

/**工厂补充原料 */
export const T_fact = function (room: Room) {
    if(room.memory._typed._type != 'owned') return[]
    const storage = room.storage
    const terminal = room.terminal
    const config = room.memory._typed._struct.factory
    const factory = config.fact_id ? Game.getObjectById(config.fact_id) : null
    if (!storage || !terminal || !factory) return []
    var tasks: Posed<PrimitiveDescript<'transfer'>>[] = []

    /**压缩资源 */
    for(let res of compressed){
        if(storage.store[res] >= 0.03 * storage.store.getCapacity())
            continue
        const components = COMMODITIES[res].components
        let component: keyof typeof components
        for(component in components){
            //console.log(factory.store[component])
            if(storage.store[component] >= 0.06 * storage.store.getCapacity()
                    && factory.store[component] < components[component] * 10){
                tasks.push({
                    action: 'transfer',
                    args: [factory.id, component],
                    pos: factory.pos
                })
            }
        }
    }
    
    /**高级商品 */
    const levels = factory.level ? [factory.level,0] : [0]
    for(let level of levels)
    for(let res of product_tier[level]){
        const components = COMMODITIES[res].components
        let component: keyof typeof components
        for(component in components){
            if(factory.store[component] < components[component] * 3){
                if(terminal.store[component])
                    tasks.push({ action: 'transfer', args: [factory.id, component], pos: factory.pos })
                else if(config.cd_bucket < 1000) {
                    demand_res(terminal,component,components[component] * 4)
                }
            }
        }
    }
    return tasks
}

/**更新可用于生产高级商品的时长，大于1000ticks说明不会浪费ops */
export const check_components = function(room: Room){
    if(room.memory._typed._type != 'owned') return
    const terminal = room.terminal
    const config = room.memory._typed._struct.factory
    const factory = config.fact_id ? Game.getObjectById(config.fact_id) : null
    if (!terminal || !factory?.level) return
    config.level = factory.level

    config.cd_bucket = 0
    for(let res of product_tier[config.level]){
        const times_kt = ceil(1000/COMMODITIES[res].cooldown)
        let min_times = 255
        const components = COMMODITIES[res].components
        let component: keyof typeof components
        for(component in components){
            const times = floor((factory.store[component] + terminal.store[component])
                / components[component])
            if(times < min_times) min_times = times
            if(times < times_kt) {
                demand_res(terminal,component,components[component] * times_kt)
            }
        }
        config.cd_bucket += min_times * COMMODITIES[res].cooldown
    }
    console.log(`${room.name}\tfact_level: ${config.level}\tcd_bucket: ${config.cd_bucket}`)
}
_.assign(global, {check_components:check_components})

export const W_fact = function (room: Room) {
    if(room.memory._typed._type != 'owned') return[]
    if (!room.memory._typed._struct.factory) return []
    const storage = room.storage
    const terminal = room.terminal
    const config = room.memory._typed._struct.factory
    const factory = config.fact_id ? Game.getObjectById(config.fact_id) : null
    if (!storage || !terminal || !factory) return []

    var tasks: Posed<PrimitiveDescript<'withdraw'>>[] = []
    for(let res of compressed){
        if(res == 'battery' && storage.store['energy'] < 240000)
            continue
        if(factory.store[res] > 2000){
            tasks.push({
                action: 'withdraw',
                args: [factory.id, res],
                pos: factory.pos
            })
        }
    }
    for(let res of product_tier[0]){
        if(factory.store[res] >= 1200){
            tasks.push({
                action: 'withdraw',
                args: [factory.id, res, factory.store[res] - 1000],
                pos: factory.pos
            })
        }
    }
    if(!factory.level) return tasks
    for(let res of product_tier[factory.level]){
        if(factory.store[res] > terminal.store[res]){
            tasks.push({
                action: 'withdraw',
                args: [factory.id, res],
                pos: factory.pos
            })
        }
    }
    return tasks
}