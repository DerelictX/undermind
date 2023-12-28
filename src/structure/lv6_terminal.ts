import {base_mineral, compressed, product_tier} from "@/constant/resource_series"

export const terminal_run = function (room: Room) {
    if (Game.time % 10 != 0) return
    const storage = room.storage
    const terminal = room.terminal
    if (!storage || !terminal?.my || terminal.cooldown) return
    if (storage.store.getFreeCapacity() < 100000 && terminal.store.energy > 30000) {
        const order = Memory.terminal.overflow?.shift()
        if (order) {
            const amount = order.amount > 10000 ? 10000 : order.amount
            Game.market.deal(order.id, amount, room.name)
            return
        }
        Memory.terminal.overflow = Game.market.getAllOrders({type: ORDER_BUY, resourceType: 'energy'})
            .filter(order => order.price >= 10 && order.amount > 1000)
        return
    }

    if (Game.time % 40 === 0) {
        sendList(terminal, compressed.concat(product_tier[0]))
    } else if (Game.time % 40 === 10) {
        if (storage)
            sendList(terminal, ['energy', 'ops', 'power', 'metal', 'biomass', 'silicon', 'mist'], storage.store)
    } else if (Game.time % 40 === 20) {
        const config = room.memory.factory
        if (config?.product)
            sendList(terminal, [config.product])
    } else if (Game.time % 40 === 30) {
        if (storage)
            sendList(terminal, base_mineral, storage.store)
    }
}

/**
 * 请求资源
 * @param terminal
 * @param resourceType
 * @param amount
 * @returns
 */
export const demand_res = function (terminal: StructureTerminal,
                                    resourceType: ResourceConstant, amount: number) {
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
const sendList = function (terminal: StructureTerminal, list: ResourceConstant[],
                           supply?: StorePropertiesOnly) {
    if (terminal.cooldown) return
    for (let resourceType of list) {
        let amount = terminal.store[resourceType]
        if (supply && supply[resourceType] < amount)
            amount = supply[resourceType]
        const demand = Memory.terminal.demand[resourceType]
        if (!demand || amount <= 0) continue

        for (const toRoom in demand) {
            if (!demand[toRoom]) continue
            if (demand[toRoom] > amount) {
                demand[toRoom] -= amount
            } else {
                amount = demand[toRoom]
                delete demand[toRoom]
            }
            const ret = terminal.send(resourceType, amount, toRoom)
            console.log(`${terminal.room.name} -> ${toRoom}\t[${resourceType} : ${amount}] : ${ret}`)
            return resourceType
        }
    }
}

export const T_term = function (room: Room) {
    const storage = room.storage
    const terminal = room.terminal
    if (!storage || !terminal || terminal.store.getFreeCapacity() < 50000)
        return []

    let tasks: RestrictedPrimitiveDescript<'transfer'>[] = [];
    let storage_store: StorePropertiesOnly = storage.store
    let resourceType: keyof typeof storage_store
    for (resourceType in storage_store) {
        let target_amount = 3000
        if (resourceType == 'energy') target_amount = 30000
        if (resourceType == 'power') target_amount = 1000
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
    if (!storage || !terminal || storage.store.getFreeCapacity() < 60000)
        return []

    let tasks: RestrictedPrimitiveDescript<'withdraw'>[] = [];
    let terminal_store: StorePropertiesOnly = terminal.store
    let resourceType: keyof typeof terminal_store
    for (resourceType in terminal_store) {
        let target_amount = 3000
        if (resourceType == 'energy') target_amount = 30000
        if (resourceType == 'power') target_amount = 1000
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