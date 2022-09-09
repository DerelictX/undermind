export const terminal_run = function(){
    var terminals: StructureTerminal[] = []
    for(let room_name in Memory.rooms){
        const room = Game.rooms[room_name]
        if(!room) continue
        if(room.terminal && room.terminal.my){
            terminals.push(room.terminal)
        }
    }

    for(let i in terminals){
        const terminal_from = terminals[i]
        var terminal_store: StorePropertiesOnly = terminal_from.store
        var resourceType: keyof typeof terminal_store

        if(terminal_from.cooldown != 0 || terminal_from.store['energy'] < 20000)
            continue

        for(resourceType in terminal_store){
            let target_amount = 1000
            if(resourceType == 'energy')
                target_amount = 15000

            if(terminal_store[resourceType] >= target_amount * 6){
                for(let j in terminals){
                    if(i == j) continue
                    const terminal_to = terminals[j]
                    if(terminal_to.store[resourceType] < target_amount * 2){
                        terminal_from.send(
                            resourceType,
                            target_amount * 3 - terminal_to.store[resourceType],
                            terminal_to.room.name)
                        return
                    }
                }
            }
            
        }
    }
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
    G: 6000,

    UH: 1000,
    UO: 1000,
    KH: 1000,
    KO: 1000,
    LH: 1000,
    LO: 1000,
    ZH: 1000,
    ZO: 1000,
    GH: 1000,
    GO: 1000,

    UH2O: 1000,
    UHO2: 1000,
    KH2O: 1000,
    KHO2: 1000,
    LH2O: 1000,
    LHO2: 1000,
    ZH2O: 1000,
    ZHO2: 1000,
    GH2O: 1000,
    GHO2: 1000,

    XUH2O: 10000,
    XUHO2: 10000,
    XKH2O: 10000,
    XKHO2: 10000,
    XLH2O: 10000,
    XLHO2: 10000,
    XZH2O: 10000,
    XZHO2: 10000,
    XGH2O: 10000,
    XGHO2: 10000,

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