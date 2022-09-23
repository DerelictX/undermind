export const factory_run = function(room: Room){
    if(room.memory._typed._type != 'owned') return
    if(!room.memory._typed._struct.factory) return
    const factory = Game.getObjectById(room.memory._typed._struct.factory)
    if(!factory || factory.cooldown) return

    for(let res of compressed){
        if(factory.store[res] > 2000) continue
        if(factory.produce(res) == OK) return
    }
    for(let res of product_tier[0]){
        if(factory.produce(res) == OK) return
    }
    if(!factory.level) return
    for(let res of product_tier[factory.level]){
        if(factory.produce(res) == OK) return
    }
}

export const T_fact = function (room: Room) {
    if(room.memory._typed._type != 'owned') return[]
    if (!room.memory._typed._struct.factory) return []
    const storage = room.storage
    const terminal = room.terminal
    const factory = Game.getObjectById(room.memory._typed._struct.factory)
    if (!storage || !terminal || !factory) return []

    var tasks: Posed<PrimitiveDescript<'transfer'>>[] = []
    for(let res of compressed){
        if(storage.store[res] >= 30000)
            continue
        const components = COMMODITIES[res].components
        let component: keyof typeof components
        for(component in components){
            //console.log(factory.store[component])
            if(storage.store[component] >= 60000
                    && factory.store[component] < components[component] * 10){
                tasks.push({
                    action: 'transfer',
                    args: [factory.id, component],
                    pos: factory.pos
                })
            }
        }
    }
    for(let res of product_tier[0]){
        const components = COMMODITIES[res].components
        let component: keyof typeof components
        for(component in components){
            if(terminal.store[component] >= 100
                    && factory.store[component] < components[component] * 2){
                tasks.push({
                    action: 'transfer',
                    args: [factory.id, component],
                    pos: factory.pos
                })
            }
        }
    }
    return tasks
}

export const W_fact = function (room: Room) {
    if(room.memory._typed._type != 'owned') return[]
    if (!room.memory._typed._struct.factory) return []
    const storage = room.storage
    const terminal = room.terminal
    const factory = Game.getObjectById(room.memory._typed._struct.factory)
    if (!storage || !terminal || !factory) return []

    var tasks: Posed<PrimitiveDescript<'withdraw'>>[] = []
    for(let res of compressed){
        if(factory.store[res] > 2000){
            tasks.push({
                action: 'withdraw',
                args: [factory.id, res],
                pos: factory.pos
            })
        }
    }
    for(let res of product_tier[0]){
        if(factory.store[res] > 100){
            tasks.push({
                action: 'withdraw',
                args: [factory.id, res],
                pos: factory.pos
            })
        }
    }
    return tasks
}

const compressed:CommodityConstant[] = [
    'utrium_bar','keanium_bar','zynthium_bar','lemergium_bar',
    'ghodium_melt','oxidant','reductant','purifier'
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