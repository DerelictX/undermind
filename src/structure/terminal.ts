import _ from "lodash"

export const terminal_run = function(){
    let resourceType: ResourceConstant
    for(resourceType in Memory.terminal.demand) {
        const demand = Memory.terminal.demand[resourceType]
        const supply = Memory.terminal.supply[resourceType]
        if(!demand || !supply) continue

        let toRoom: string|undefined = undefined
        for(toRoom in demand)
            if(demand[toRoom]) break
        if(!toRoom) continue

        let terminal: StructureTerminal|undefined
        for(let fromRoom in supply){
            terminal = Game.rooms[fromRoom]?.terminal
            if(!supply[fromRoom] || !terminal || terminal.cooldown) continue

            delete supply[fromRoom]
            delete demand[toRoom]
            const ret = terminal.send(resourceType,T_term_thre[resourceType],toRoom)
            console.log(fromRoom + ' -> ' + toRoom + ' ' + ret + ' ' + resourceType)
            return
        }
    }
}

export const update_export = function(room:Room){
    const storage = room.storage
    const terminal = room.terminal
    if(!storage?.my || !terminal?.my) return

    var storage_store: StorePropertiesOnly = storage.store
    var resourceType: keyof typeof storage_store
    for (resourceType in storage_store) {
        let target_amount = T_term_thre[resourceType]
        if (storage.store[resourceType] > target_amount * 2) {
            if(!Memory.terminal.supply[resourceType])
                Memory.terminal.supply[resourceType] = {}
            const supply = Memory.terminal.supply[resourceType]
            if(supply) supply[room.name] = true
        }
    }
}
_.assign(global, {update_export:update_export})

export const update_import = function(room:Room){
    const storage = room.storage
    const terminal = room.terminal
    if(!storage?.my || !terminal?.my) return

    var terminal_store: StorePropertiesOnly = terminal.store
    var resourceType: keyof typeof terminal_store
    for (resourceType in base) {
        let target_amount = T_term_thre[resourceType]
        if (terminal.store[resourceType] < target_amount) {
            if(!Memory.terminal.demand[resourceType])
                Memory.terminal.demand[resourceType] = {}
            const demand = Memory.terminal.demand[resourceType]
            if(demand) demand[room.name] = true
        }
    }
}
_.assign(global, {update_import:update_import})

const base: {[R in MineralConstant|MineralBaseCompoundsConstant]: number} = {
    OH: 0,
    X: 0,
    O: 0,
    H: 0,
    G: 0,
    ZK: 0,
    UL: 0,
    U: 0,
    L: 0,
    K: 0,
    Z: 0,
}

export const T_term_thre: {[R in ResourceConstant]: number} = {
    energy: 30000,
    power: 1000,
    ops: 1000,

    U: 3000,
    L: 3000,
    K: 3000,
    Z: 3000,
    O: 3000,
    H: 3000,
    X: 3000,

    OH: 3000,
    ZK: 3000,
    UL: 3000,
    G: 3000,

    UH: 2000,
    UO: 2000,
    KH: 2000,
    KO: 2000,
    LH: 2000,
    LO: 2000,
    ZH: 2000,
    ZO: 2000,
    GH: 2000,
    GO: 2000,

    UH2O: 2000,
    UHO2: 2000,
    KH2O: 2000,
    KHO2: 2000,
    LH2O: 2000,
    LHO2: 2000,
    ZH2O: 2000,
    ZHO2: 2000,
    GH2O: 2000,
    GHO2: 2000,

    XUH2O: 6000,
    XUHO2: 6000,
    XKH2O: 6000,
    XKHO2: 6000,
    XLH2O: 6000,
    XLHO2: 6000,
    XZH2O: 6000,
    XZHO2: 6000,
    XGH2O: 6000,
    XGHO2: 6000,

    mist: 3000,
    biomass: 3000,
    metal: 3000,
    silicon: 3000,
    //compressed
    utrium_bar: 1000,
    lemergium_bar: 1000,
    zynthium_bar: 1000,
    keanium_bar: 1000,
    ghodium_melt: 1000,
    oxidant: 1000,
    reductant: 1000,
    purifier: 1000,
    battery: 1000,
    //common
    composite: 1000,
    crystal: 1000,
    liquid: 1000,
    //electronical
    wire: 1000,
    switch: 1000,
    transistor: 1000,
    microchip: 1000,
    circuit: 1000,
    device: 1000,
    //biological
    cell: 1000,
    phlegm: 1000,
    tissue: 1000,
    muscle: 1000,
    organoid: 1000,
    organism: 1000,
    //mechanical
    alloy: 1000,
    tube: 1000,
    fixtures: 1000,
    frame: 1000,
    hydraulics: 1000,
    machine: 1000,
    //mystical
    condensate: 1000,
    concentrate: 1000,
    extract: 1000,
    spirit: 1000,
    emanation: 1000,
    essence: 1000
}