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
            const ret = terminal.send(resourceType,3000,toRoom)
            console.log(fromRoom + ' -> ' + toRoom + ' ' + ret + ' ' + resourceType)
            return
        }
    }
}

export const T_term = function (room: Room) {
    const storage = room.storage
    const terminal = room.terminal
    if (!storage || !terminal)
        return []
    if (terminal.store.getFreeCapacity() < 50000)
        return []

    var tasks: Posed<PrimitiveDescript<'transfer'>>[] = []
    var storage_store: StorePropertiesOnly = storage.store
    var resourceType: keyof typeof storage_store
    for (resourceType in storage_store) {
        let target_amount = 3000
        if (terminal.store[resourceType] < target_amount) {
            tasks.push({
                action: 'transfer',
                args: [terminal.id, resourceType],
                pos: terminal.pos
            })
        }
    }
    return tasks
}

export const W_term = function (room: Room) {
    const storage = room.storage
    const terminal = room.terminal
    if (!storage || !terminal)
        return []
    if (storage.store.getFreeCapacity() < 100000)
        return []

    var tasks: Posed<PrimitiveDescript<'withdraw'>>[] = []
    let terminal_store: StorePropertiesOnly = terminal.store
    let resourceType: keyof typeof terminal_store
    for (resourceType in terminal_store) {
        let target_amount = 3000
        if(resourceType == 'energy') target_amount = 30000
        if (terminal_store[resourceType] > target_amount * 2) {
            tasks.push({
                action: 'withdraw',
                args: [terminal.id, resourceType],
                pos: terminal.pos
            })
        }
    }
    return tasks
}

const base: {
    [R in MineralConstant|MineralBaseCompoundsConstant]: 3000
} = {
    OH: 3000,
    X: 3000,
    O: 3000,
    H: 3000,
    G: 3000,
    ZK: 3000,
    UL: 3000,
    U: 3000,
    L: 3000,
    K: 3000,
    Z: 3000,
}