import { compressed, deposits, product_tier } from "@/constant/resource_series"
import _ from "lodash"

export const terminal_run = function(room: Room){
    if(Game.time % 20 != 3) return
    if(room.memory._typed._type != 'owned') return
    const storage = room.storage
    const terminal = room.terminal
    if (!storage || !terminal || terminal.cooldown) return

    let list:(CommodityConstant|DepositConstant)[] = []
    list = list.concat(compressed).concat(deposits).concat(product_tier[0])
    if(sendList(terminal,list)) return

    if(Game.time % 30 != 3) return
    const config = room.memory._typed._struct.factory
    if(config.level)
        sendList(terminal,product_tier[config.level])
}

const sendList = function(terminal: StructureTerminal, list: ResourceConstant[]){
    if(terminal.cooldown) return
    for (let resourceType of list) {
        let amount = terminal.store[resourceType]
        const demand = Memory.terminal.demand[resourceType]
        if(!demand || !amount) continue
        let toRoom: string|undefined = undefined
        for(toRoom in demand) if(demand[toRoom]) break
        if(!toRoom) continue
        
        if(demand[toRoom] < amount) amount = demand[toRoom]
        delete demand[toRoom]
        const ret = terminal.send(resourceType, amount , toRoom)
        console.log(`${terminal.room.name} -> ${toRoom}\t[${resourceType} : ${amount}] : ${ret}`)
        return resourceType
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