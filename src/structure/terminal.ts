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
    if(sendList(terminal,['ops','power'],storage.store)) return
    if(Game.time % 30 != 3) return
    const config = room.memory._typed._struct.factory
    if(config.level)
        sendList(terminal,product_tier[config.level])
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
        let amount = supply ? supply[resourceType] : terminal.store[resourceType]
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