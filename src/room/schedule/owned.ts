import { parse_posed_task } from "@/performer/behavior.callback"
import { init_carrier_behavior, init_worker_behavior } from "@/role/initializer/config.behavior"
import { change_reaction } from "@/structure/lv6_lab"
import { structure_updater } from "../../scanner/structure.updater"

export const owned_room_loop_handler = {
    Collector: function (room: Room, looper: Looper) {
        looper.interval = 1450
        if (!room.storage?.my){
            return {
                _body: { generator: 'C', workload: 16 },
                _class: init_worker_behavior('EnergySupplier', room.name, room.name)
            }
        }
        return {
            _body: { generator: 'C', workload: 16 },
            _class: init_carrier_behavior('Collector', room.name, room.name)
        }
    },
    
    Supplier: function (room: Room, looper: Looper) {
        if (!room.memory._struct)
            return null
        structure_updater.towers(room, room.memory._struct)
        structure_updater.links(room, room.memory._struct)
        if (!room.storage?.my){
            return {
                _body: { generator: 'C', workload: 16 },
                _class: init_worker_behavior('EnergySupplier', room.name, room.name)
            }
        }
        return {
            _body: { generator: 'C', workload: 16 },
            _class: init_carrier_behavior('Supplier', room.name, room.name)
        }
    },

    containers: function (room:Room) {
        const containers:StructureContainer[] = room.find(FIND_STRUCTURES,{
            filter: {structureType: STRUCTURE_CONTAINER}
        });
        const task: StaticMemory = {
            bhvr_name:  'static',
            state:      'collect',
            collect:    [],
            consume:    []
        }
        for(let container of containers){
            if(container.pos.findInRange(FIND_SOURCES,2).length){
                task.collect.push({
                    action: 'withdraw',
                    args: [container.id,'energy'],
                    pos: container.pos
                })
            } else {
                const mineral = container.pos.findInRange(FIND_MINERALS,2)
                if(mineral[0]) {
                    task.collect.push({
                        action: 'withdraw',
                        args: [container.id,mineral[0].mineralType],
                        pos: container.pos
                    })
                } else {
                    task.consume.push({
                        action: 'transfer',
                        args: [container.id,'energy'],
                        pos: container.pos
                    })
                }
            }
        }
    },
}

const Observe = function (room: Room, looper: Looper) {
    if (!room.memory._struct)
        return null
    structure_updater.labs(room, room.memory._struct)
    change_reaction(room)
    Memory._closest_owned[room.name] = {
        root:   room.name,
        prev:   room.name,
        dist:   0,
        time:   Game.time
    }
    room.memory._struct.observer.BFS_open = [room.name]
    looper.interval = 400
    return null
}
