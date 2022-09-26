import _ from "lodash"

const commo_depo = {
    [RESOURCE_MACHINE]: {
        "machine":      1110,
        "hydraulics":   423,
        "frame":        162,
        "fixtures":     41,
        "tube":         20,
        "alloy":        1
    },
    [RESOURCE_ORGANISM]: {
        "organism":     1110,
        "organoid":     470,
        "muscle":       195,
        "tissue":       55,
        "phlegm":       10,
        "cell":         1
    },
    [RESOURCE_DEVICE]: {
        "device":       1111,
        "circuit":      478,
        "microchip":    211,
        "transistor":   47,
        "switch":       8,
        "wire":         1
    },
    [RESOURCE_ESSENCE]: {
        "essence":      1110,
        "emanation":    540,
        "spirit":       190,
        "extract":      65,
        "concentrate":  10,
        "condensate":   1
    }
}

type commo_material = DepositConstant | CommodityConstant 
    | MineralConstant | RESOURCE_ENERGY | RESOURCE_GHODIUM
type commo_node = Partial<Record<commo_material, number>>
export const expand_commo = function(res: commo_material): commo_node{
    const this_node: commo_node = {[res]:1}
    switch(res){
        case 'energy':
        case 'G':
        case 'X':
        case 'H':
        case 'O':
        case 'Z':
        case 'K':
        case 'L':
        case 'U':
        case 'mist':
        case 'biomass':
        case 'metal':
        case 'silicon':
        return {}
    }
    const components = COMMODITIES[res].components
    let component: keyof typeof components
    for(component in components){
        const child = expand_commo(component)
        let material: commo_material
        for(material in child){
            this_node[material] = (this_node[material] ?? 0)
                + (child[material] ?? 0)
                * components[component] / COMMODITIES[res].amount
        }
    }
    const basic = (this_node['alloy'] ?? 0) + (this_node['cell'] ?? 0)
            + (this_node['wire'] ?? 0) + (this_node['condensate'] ?? 0)
    if(basic) console.log(res + '\t' + basic)
    return this_node
}
_.assign(global, {expand_commo:expand_commo})

const commo_path = {
    [RESOURCE_MACHINE]: {
        "machine":      1,
        "hydraulics":   1,
        "frame":        2,
        "fixtures":     10,
        "tube":         35,
        "liquid":       150,
        "composite":    200,
    },
    [RESOURCE_ORGANISM]: {
        "organism":     1,
        "organoid":     1,
        "muscle":       1,
        "tissue":       14,
        "phlegm":       73,
        "liquid":       150,
    },
    [RESOURCE_DEVICE]: {
        "device":       1,
        "circuit":      1,
        "microchip":    4,
        "transistor":   13,
        "switch":       56,
        "crystal":      110,
        "composite":    200,
    },
    [RESOURCE_ESSENCE]: {
        "essence":      1,
        "emanation":    1,
        "spirit":       5,
        "extract":      12,
        "concentrate":  93,
        "crystal":      110,
    }
}
