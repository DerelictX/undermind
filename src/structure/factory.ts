import { compression, product_tier } from "@/constant/resource_series"
import _ from "lodash"
import { demand_res } from "./terminal"

export const factory_run = function(room: Room){
    if(room.memory._typed._type != 'owned') return
    const config = room.memory._typed._struct.factory
    const storage = room.storage
    const factory = config.fact_id ? Game.getObjectById(config.fact_id) : null
    if(!storage || !factory) return

    //显示
    if(config.product) {
        const opts: TextStyle = {
            font:0.5,color:'#FF7F7F',
            stroke:'#7F7F00',
            strokeWidth:0.1
        }
        room.visual.text(config.product,factory.pos,opts)
    }
    if(factory.cooldown) return

    //合成商品
    if(factory.effects?.[0]){
        delete config.operate
        if(config.product) {
            factory.produce(config.product)
        }
        return
    }

    if(config.reload_time > Game.time){
        //
    } else {
        config.reload_time = Game.time + 1000
        change_production(room)
    }

    for(let resourceType of product_tier[0]){
        if(factory.produce(resourceType) == OK) return
    }

    //解压
    let mineral: keyof typeof compression
    for(mineral in compression){
        const bar = compression[mineral]
        if(storage.store[bar] < 10000 || factory.store[bar] < 1000) continue
        if(storage.store[mineral] > storage.store[bar]) continue
        if(factory.produce(mineral) == OK) return
    }
    if(storage.store.energy < 160000)
        factory.produce('energy')
}

/**工厂补充原料 */
export const T_fact = function (room: Room) {
    if(room.memory._typed._type != 'owned') return[]
    const terminal = room.terminal
    const config = room.memory._typed._struct.factory
    const factory = config.fact_id ? Game.getObjectById(config.fact_id) : null
    if (!terminal || !factory) return []
    var tasks: RestrictedPrimitiveDescript<'transfer'>[] = []
    
    const demand = Memory.factory.demand[factory.level ?? 0]
    let component: ResourceConstant
    for(component in demand){
        const amount = demand[component] ?? 0
        if(factory.store[component] >= amount * 2)
            continue
        if(terminal.store[component])
            tasks.push({ action: 'transfer', args: [factory.id, component], pos: factory.pos })
        else demand_res(terminal,component,amount)
    }
    return tasks
}

export const W_fact = function (room: Room) {
    if(room.memory._typed._type != 'owned') return[]
    const terminal = room.terminal
    const config = room.memory._typed._struct.factory
    const factory = config.fact_id ? Game.getObjectById(config.fact_id) : null
    if (!terminal || !factory) return []
    var tasks: RestrictedPrimitiveDescript<'withdraw'>[] = []

    const demand = Memory.factory.demand[factory.level ?? 0]
    let resourceType: ResourceConstant
    let factory_store: StorePropertiesOnly = factory.store
    for(resourceType in factory_store){
        if(demand[resourceType]) continue
        if(factory_store[resourceType] > terminal.store[resourceType]){
            tasks.push({ action: 'withdraw', args: [factory.id, resourceType], pos: factory.pos })
        }
    }
    if(factory.store.energy > 10000) {
        tasks.push({ action: 'withdraw', args: [factory.id, 'energy'], pos: factory.pos })
    }
    return tasks
}

/**更新可用于生产高级商品的时长，大于1000ticks说明不会浪费ops */
export const change_production = function(room: Room){
    if(room.memory._typed._type != 'owned') return
    const config = room.memory._typed._struct.factory
    const factory = config.fact_id ? Game.getObjectById(config.fact_id) : null
    if (!factory?.level) return

    for(let product of product_tier[factory.level]){
        config.product = product
        const demand = Memory.factory.demand[factory.level]
        const components = COMMODITIES[product].components
        let component: keyof typeof components
        for(component in components){
            if(factory.store[component] < (demand[component] ?? 0)){
                delete config.product
                break
            }
        }
        if(config.product) {
            config.operate = factory.level
            break
        }
    }
    console.log(`${room.name}.product:\t${config.product}`)
    return config.product
}
_.assign(global, {check_components:change_production})