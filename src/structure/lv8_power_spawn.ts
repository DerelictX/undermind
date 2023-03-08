import { demand_res } from "./lv6_terminal"

export const power_spawn_run = function(room: Room){
    if(!room.memory.power_spawn)
        return
    const power_spawn = Game.getObjectById(room.memory.power_spawn)
    if(power_spawn && power_spawn.store['power'])
        power_spawn.processPower()
}

export const T_power = function (room: Room): PosedCreepTask<"transfer">[] {
    if (!room.memory.power_spawn)
        return []
    const power_spawn = Game.getObjectById(room.memory.power_spawn)
    if (!power_spawn)
        return []
    var tasks: PosedCreepTask<'transfer'>[] = []

    if (room.storage && room.storage.store['energy'] > 150000
            && power_spawn.store['energy'] <= 3000) {
        tasks.push({
            action: 'transfer',
            args: [power_spawn.id, 'energy'],
            pos: power_spawn.pos
        })
    }
    if (room.terminal && power_spawn.store['power'] <= 50) {
        if(room.terminal.store['power']){
            tasks.push({
                action: 'transfer',
                args: [power_spawn.id, 'power', power_spawn.store.getFreeCapacity('power')],
                pos: power_spawn.pos
            })
        } else {
            demand_res(room.terminal,'power',1000)
        }
    }
    return tasks
}

export const T_nuker = function (room: Room): PosedCreepTask<"transfer">[] {
    if (!room.memory.nuker)
        return []
    const nuker = Game.getObjectById(room.memory.nuker)
    if (!nuker)
        return []
    var tasks: PosedCreepTask<'transfer'>[] = []

    if (room.storage && room.storage.store['energy'] > 150000
        && nuker.store.getFreeCapacity('energy')) {
        tasks.push({
            action: 'transfer',
            args: [nuker.id, 'energy'],
            pos: nuker.pos
        })
    }
    if (room.terminal?.store['G'] && nuker.store.getFreeCapacity('G')) {
        tasks.push({
            action: 'transfer',
            args: [nuker.id, 'G', nuker.store.getFreeCapacity('G')],
            pos: nuker.pos
        })
    }
    return tasks
}