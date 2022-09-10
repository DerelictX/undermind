export const power_spawn_run = function(room: Room){
    if(room.memory._typed._type != 'owned') return
    if(!room.memory._typed._struct.power_spawn)
        return
    const power_spawn = Game.getObjectById(room.memory._typed._struct.power_spawn)
    if(power_spawn && power_spawn.store['power'])
        power_spawn.processPower()
}