import { compressed, compression, product_tier } from "@/constant/resource_series"
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
    /*
    for(let res of compressed){
        if(factory.store[res] > 2000) continue
        if(factory.produce(res) == OK) return
    }
    */
}

export const compress = function (room: Room) {
    if(room.memory._typed._type != 'owned') return[]
    const storage = room.storage
    const terminal = room.terminal
    const config = room.memory._typed._struct.factory
    const factory = config.fact_id ? Game.getObjectById(config.fact_id) : null
    if (!storage || !terminal || !factory) return []
    var tasks: RestrictedPrimitiveDescript<'transfer'>[] = []

    /**压缩资源 */
    let res : keyof typeof compression
    for(res in compression){
        const bar = compression[res]
        if(storage.store[res] >= 0.05 * storage.store.getCapacity()
                && factory.store[res] < 3000){
            tasks.push({ action: 'transfer', args: [factory.id, res], pos: factory.pos })
        }
        if(terminal.store[bar] && factory.store[bar] < 600){
            tasks.push({ action: 'transfer', args: [factory.id, bar], pos: factory.pos })
        }
    }
    return tasks
}

/**工厂补充原料 */
export const T_fact = function (room: Room) {
    if(room.memory._typed._type != 'owned') return[]
    const terminal = room.terminal
    const config = room.memory._typed._struct.factory
    const factory = config.fact_id ? Game.getObjectById(config.fact_id) : null
    if (!terminal || !factory) return []
    var tasks: RestrictedPrimitiveDescript<'transfer'>[] = []
    
    if(!config.demand) config.demand = {}
    let component: ResourceConstant
    for(component in config.demand){
        const amount = config.demand[component] ?? 0
        if(factory.store[component] >= amount)
            continue
        if(terminal.store[component])
            tasks.push({ action: 'transfer', args: [factory.id, component], pos: factory.pos })
        else if(config.cd_bucket < 1000) {
            demand_res(terminal,component,amount)
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
    config.demand = {}
    config.cd_bucket = 0
    for(let product of product_tier[config.level]){
        const times_kt = ceil(1000/COMMODITIES[product].cooldown)
        let min_times = 255
        const components = COMMODITIES[product].components
        let component: keyof typeof components
        for(component in components){
            config.demand[component] = (config.demand[component] ?? 0)
                + components[component] * times_kt            
            const times = floor((factory.store[component] + terminal.store[component])
                / components[component])
            if(times < min_times) min_times = times
        }
        config.cd_bucket += min_times * COMMODITIES[product].cooldown
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

    var tasks: RestrictedPrimitiveDescript<'withdraw'>[] = []
    for(let res of compressed){
        if(res == 'battery' && storage.store['energy'] < 180000)
            continue
        if(factory.store[res] > 5000){
            tasks.push({
                action: 'withdraw',
                args: [factory.id, res],
                pos: factory.pos
            })
        }
    }

    if(!factory.level) {
        for(let res of product_tier[0]){
            if(factory.store[res] > terminal.store[res]){
                tasks.push({ action: 'withdraw', args: [factory.id, res], pos: factory.pos })
            }
        }
        return tasks
    }
    for(let res of product_tier[0]){
        if(factory.store[res] >= 1200){
            tasks.push({
                action: 'withdraw', args: [factory.id, res, factory.store[res] - 1000], pos: factory.pos
            })
        }
    }
    for(let res of product_tier[factory.level]){
        if(factory.store[res] > terminal.store[res]){
            tasks.push({ action: 'withdraw', args: [factory.id, res], pos: factory.pos })
        }
    }
    return tasks
}