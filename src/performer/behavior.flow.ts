import { collect_updater } from "@/scanner/collect"
import { consume_updater } from "@/scanner/consume"
import { TASK_DOING } from "./behavior.any"
import { goPerform } from "./action.primitive"

export const perfrom_flow = function(creep:Creep,fb:FlowBehavior){
    if(fb.state == 'collect'){
        if(!fb.collect[0]){
            fb.state = 'consume'
            return TASK_DOING
        }
        const ret = goPerform(creep,fb.collect[0])
        if(ret != OK) fb.collect.shift()
        return TASK_DOING
    }
    if(fb.state == 'consume'){
        if(!fb.consume[0]){
            fb.state = 'collect'
            return TASK_DOING
        }
        const ret = goPerform(creep,fb.consume[0])
        if(ret != OK) fb.consume.shift()
        return TASK_DOING
    }
}

const change_flow = function(fb:FlowBehavior) {
    const collect = Memory.rooms[fb.fromRoom]._collect
    const consume = Memory.rooms[fb.fromRoom]._consume
    for(let flow of fb.priority){
        if(flow[0] == 'lazy' && flow[1] == 'lazy') continue
        if(flow[0] != 'lazy' && collect[flow[0]]?.length) continue
        if(flow[1] != 'lazy' && consume[flow[1]]?.length) continue
        fb.current = flow
        return
    }
}

const lazy_restock = function(creep:Creep,fb:FlowBehavior) {
    const toRoom = Game.rooms[fb.toRoom]
    if(!toRoom) return
    let storage:AnyStoreStructure|undefined = toRoom.storage
    if(!storage || !storage.my || storage.store.getFreeCapacity() < 100000)
        storage = toRoom.terminal
    if(!storage || !storage.my || storage.store.getFreeCapacity() < 50000)
        return

    var store: StorePropertiesOnly = creep.store
    var resourceType: keyof typeof store
    for (resourceType in store) {
        fb.consume.push({
            action: 'transfer',
            args: [storage.id, resourceType]
        })
    }
}

const lazy_storage = function(fb:FlowBehavior) {
    const storage = Game.rooms[fb.fromRoom].storage
    if(!storage) return
    for(let consume of fb.consume){
        let collect: ActionDescript<'withdraw'> = {
            action: 'withdraw',
            args:   [storage.id,'energy']
        }
        if(consume.action == 'generateSafeMode')
            collect.args = [storage.id,'G',1000]
        else if(consume.action == 'transfer' && consume.args[1] != 'energy')
            collect.args = [storage.id,consume.args[1],consume.args[2]]

        const last_collect = fb.collect.at(-1)
        if(last_collect && last_collect.action == 'withdraw'
                && last_collect.args[0] == collect.args[0]
                && last_collect.args[1] == collect.args[1]) {
            last_collect.args[2] = (last_collect.args[2] && collect.args[2])
                ? (last_collect.args[2] + collect.args[2]) : undefined
        } else fb.collect.push(collect)
    }
}

const lazy_energy = function(creep:Creep,fb:FlowBehavior){
    if(!Memory.rooms[fb.fromRoom]) return
    const structures = Memory.rooms[fb.fromRoom].structures
    let ids:Id<AnyStoreStructure>[] = structures.containers.ins
    ids = ids.concat(structures.links.outs)
    
    let stores:AnyStoreStructure[] = []
    for(let id of ids){
        const store = Game.getObjectById(id)
        if(store && store.store['energy'] > creep.store.getFreeCapacity())
            stores.push(store)
    }

    const source = creep.pos.findClosestByRange(stores)
    if(!source) return
    let collect: ActionDescript<'withdraw'> = {
        action: 'withdraw',
        args:   [source.id,'energy']
    }
}