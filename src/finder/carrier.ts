type TransportFinder = {
    from_room:  string
    to_room:    string
    priority:   TransportPriority
    collect:    TransportTask[]
    supply:     TransportTask[]
}

const link_config: {[T in supply_task_name]:collect_task_name[]} = {
    extension: [],
    tower: [],
    boost: [],
    reactant: [],
    power_spawn: []
}

const ddd: [from:collect_task_name, to:supply_task_name][] = [
    ['harvested','extension'],
    ['harvested','tower'],
    ['']
]

const link_transport = function(creep:Creep, from:TransportController, to:TransportController){

}

export const find_transport = function(creep:Creep, finder:TransportFinder) {
    for(let i in finder.priority){
        const duty = transport_finders[finder.priority[i]](creep)
        if(duty){
            //creep.say(':'+ priority[i])
            finder.collect[0] = duty
            return
        }
    }
}

export const find_store = function(creep:Creep, finder:TransportFinder) {
    const to_room = Game.rooms[finder.to_room]
    if(!to_room)
    var storage:(AnyStoreStructure&AnyOwnedStructure)|undefined
        storage = to_room.storage
    if(!storage || !storage.my || storage.store.getFreeCapacity() < 100000)
        storage = to_room.storage
    if(!storage || !storage.my || storage.store.getFreeCapacity() < 100000)
        return null
    
    var store: StorePropertiesOnly = creep.store
    var resourceType: keyof typeof store
    for(resourceType in store){
        finder.supply.push({
            source:         storage.id,
            target:         storage.id,
            resourceType:   resourceType,
            amount:         creep.store[resourceType]
        })
    }
}
