import _, { min } from "lodash"

export const terminal_run = function(){
    if(Game.time % 10 != 3){
        return
    }
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
            const amount = min([demand[toRoom],supply[fromRoom]]) ?? 0
            supply[fromRoom] -= amount
            delete demand[toRoom]
            const ret = terminal.send(resourceType, amount , toRoom)
            console.log(`${fromRoom} -> ${toRoom} [${resourceType} : ${amount}] : ${ret}`)
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
        if(resourceType == 'energy') target_amount = 30000
        if (terminal.store[resourceType] < target_amount) {
            tasks.push({
                action: 'transfer',
                args: [terminal.id, resourceType],
                pos: terminal.pos
            })
        } else if (storage_store[resourceType] > target_amount){
            const supply = Memory.terminal.supply[resourceType]
                ?? (Memory.terminal.supply[resourceType] = {})
            supply[room.name] = target_amount
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