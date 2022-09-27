import { base_mineral, compressed, product_tier } from "@/constant/resource_series"
import _ from "lodash"

export const terminal_run = function(room: Room){
    if(Game.time % 10 != 0) return
    if(room.memory._typed._type != 'owned') return
    const storage = room.storage
    const terminal = room.terminal
    if (!storage || !terminal?.my || terminal.cooldown) return

    switch(Game.time % 40){
        case 0:
            sendList(terminal,compressed.concat(product_tier[0])) 
            return
        case 10:
            sendList(terminal,['ops','power','metal','biomass','silicon','mist'],storage.store)
            return
        case 20:
            const config = room.memory._typed._struct.factory
            if(config.level)
                sendList(terminal,product_tier[config.level])
            return
        case 30:
            sendList(terminal,base_mineral,storage.store)
            return
    }
}

/**
 * 请求资源
 * @param terminal 
 * @param resourceType 
 * @param amount 
 * @returns 
 */
export const demand_res = function(terminal: StructureTerminal,
    resourceType:ResourceConstant,amount:number){
    if(!terminal) return
    const demand = Memory.terminal.demand[resourceType]
        ?? (Memory.terminal.demand[resourceType] = {})
    demand[terminal.room.name] = amount
}

/**
 * 发送list中的资源到需要的地方
 * @param terminal 终端
 * @param list 发送的资源列表
 * @param supply 最大发送数量，缺省值为终端中的资源数量
 * @returns 
 */
const sendList = function(terminal: StructureTerminal, list: ResourceConstant[],
        supply?: StorePropertiesOnly){
    if(terminal.cooldown) return
    for (let resourceType of list) {
        let amount = terminal.store[resourceType]
        if(supply){
            if(!supply[resourceType]) continue
            amount += supply[resourceType] - 3000
        }
        const demand = Memory.terminal.demand[resourceType]
        if(!demand || amount <= 0) continue
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

    var tasks: RestrictedPrimitiveDescript<'transfer'>[] = []
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

    var tasks: RestrictedPrimitiveDescript<'withdraw'>[] = []
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