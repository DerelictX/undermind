import _ from "lodash";

export const owned_rooms = [
    'E32S56','E33S57','E31S54','E41S56',
    'E35S52','E44S49','E39S55','E39S58']

export const terminal_run = function(){
    if(Game.time % 23 != 0)
        return

    var terminals: StructureTerminal[] = []
    for(let i in owned_rooms){
        const room = Game.rooms[owned_rooms[i]]
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
                if(!terminal_from.room.memory.import_cost[resourceType]){
                    terminal_from.room.memory.import_cost[resourceType] = 0
                }
                for(let j in terminals){
                    if(i == j) continue
                    const terminal_to = terminals[j]
                    if(terminal_to.store[resourceType] < target_amount * 2){
                        terminal_from.send(
                            resourceType,
                            target_amount * 3 - terminal_to.store[resourceType],
                            terminal_to.room.name)
                        terminal_to.room.memory.import_cost[resourceType]
                            = terminal_from.room.memory.import_cost[resourceType]
                            + Game.market.calcTransactionCost(1000,
                                terminal_from.room.name,terminal_to.room.name)
                        console.log(terminal_to.room.name + ':' + resourceType
                            + ':'+ terminal_to.room.memory.import_cost[resourceType])
                        return
                    }
                }
            }
            
        }
    }
}