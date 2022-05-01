import _ from "lodash";

export const terminal_run = function(){
    if(Game.time % 23 != 0)
        return

    var terminals: StructureTerminal[] = []
    for(let room_name of Memory.owned_rooms){
        const room = Game.rooms[room_name]
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