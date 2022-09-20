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

export const compressed:CommodityConstant[] = [
    'utrium_bar','keanium_bar','zynthium_bar','lemergium_bar',
    'ghodium_melt','oxidant','reductant','purifier'
]

const productions: {[d in DepositConstant]:CommodityConstant[]} = {
    mist:       ['condensate','concentrate','extract','spirit','emanation','essence'],
    biomass:    ['cell','phlegm','tissue','muscle','organoid','organism'],
    metal:      ['alloy','tube','fixtures','frame','hydraulics','machine'],
    silicon:    ['wire','switch','transistor','microchip','circuit','device']
}

export const product_tier:CommodityConstant[][]  = [
    ['alloy','cell','wire','condensate'],
    ['tube','phlegm','switch','concentrate','composite'],
    ['fixtures','tissue','transistor','extract','crystal'],
    ['frame','muscle','microchip','spirit','liquid'],
    ['hydraulics','organoid','circuit','emanation'],
    ['machine','organism','device','essence']
]