export const power_spawn_run = function(room: Room){
    if(!room.memory.structures.power_spawn)
        return
    const power_spawn = Game.getObjectById(room.memory.structures.power_spawn)
    if(power_spawn)
        power_spawn.processPower()
}