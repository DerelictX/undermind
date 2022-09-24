import _, { floor } from "lodash"

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

export const T_fact = function (room: Room) {
    if(room.memory._typed._type != 'owned') return[]
    const storage = room.storage
    const terminal = room.terminal
    const config = room.memory._typed._struct.factory
    const factory = config.fact_id ? Game.getObjectById(config.fact_id) : null
    if (!storage || !terminal || !factory) return []

    var tasks: Posed<PrimitiveDescript<'transfer'>>[] = []
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
    
    const levels = factory.level ? [factory.level,0] : [0]
    for(let level of levels)
    for(let res of product_tier[level]){
        const components = COMMODITIES[res].components
        let component: keyof typeof components
        for(component in components){
            if(factory.store[component] < components[component] * 2){
                if(terminal.store[component])
                    tasks.push({ action: 'transfer', args: [factory.id, component], pos: factory.pos })
                if(config.cd_bucket < 1000) {
                    const demand = Memory.terminal.demand[component]
                        ?? (Memory.terminal.demand[component] = {})
                    demand[room.name] = components[component] * 4
                }
            }
        }
    }
    return tasks
}

export const check_components = function(room: Room){
    if(room.memory._typed._type != 'owned') return
    const terminal = room.terminal
    const config = room.memory._typed._struct.factory
    const factory = config.fact_id ? Game.getObjectById(config.fact_id) : null
    if (!terminal || !factory?.level) return

    config.cd_bucket = 0
    for(let res of product_tier[factory.level]){
        let min_times = 255
        const components = COMMODITIES[res].components
        let component: keyof typeof components
        for(component in components){
            const times = floor((factory.store[component] + terminal.store[component])
                / components[component])
            if(times < min_times) min_times = times
        }
        config.cd_bucket += min_times * COMMODITIES[res].cooldown
    }
    console.log(room.name + '.fact_cd_bucket:\t' + config.cd_bucket)
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
        if(factory.store[res] > 500){
            tasks.push({
                action: 'withdraw',
                args: [factory.id, res, factory.store[res] - 500],
                pos: factory.pos
            })
        } else if(terminal.store[res] > 500){
            const supply = Memory.terminal.supply[res]
                ?? (Memory.terminal.supply[res] = {})
            supply[room.name] = terminal.store[res]
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
        } else {
            const supply = Memory.terminal.supply[res]
                ?? (Memory.terminal.supply[res] = {})
            supply[room.name] = terminal.store[res]
        }
    }
    return tasks
}

const compressed:CommodityConstant[] = [
    'utrium_bar','keanium_bar','zynthium_bar','lemergium_bar',
    'ghodium_melt','oxidant','reductant','purifier','battery'
]

const productions: {[d in DepositConstant]:CommodityConstant[]} = {
    mist:       ['condensate','concentrate','extract','spirit','emanation','essence'],
    biomass:    ['cell','phlegm','tissue','muscle','organoid','organism'],
    metal:      ['alloy','tube','fixtures','frame','hydraulics','machine'],
    silicon:    ['wire','switch','transistor','microchip','circuit','device']
}

const product_tier:CommodityConstant[][]  = [
    ['alloy','cell','wire','condensate'],
    ['tube','phlegm','switch','concentrate','composite'],
    ['fixtures','tissue','transistor','extract','crystal'],
    ['frame','muscle','microchip','spirit','liquid'],
    ['hydraulics','organoid','circuit','emanation'],
    ['machine','organism','device','essence']
]