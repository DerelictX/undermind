import _ from "lodash"

/**
 * 格式化房间为指定房间类型
 * @param room_name 房间名
 * @param type 房间类型
 */
export const _format_room = function (room_name: string, type: RoomTypes) {
    delete Memory.rooms[room_name]
    inspect_memory(room_name, true)
}
_.assign(global, {_format_room: _format_room})

/**
 * 房间内存完整性检查和补全
 * @param room_name 房间名
 * @param restart_room 是否重置房间
 * @returns
 */
export const inspect_memory = function (room_name: string, restart_room: boolean = false) {
    const mem = Memory.rooms[room_name] ?? (Memory.rooms[room_name] = {})
    const obj = Game.rooms[room_name] ?? undefined
    if (restart_room) {
        console.log('restart_room\t' + room_name)
    }
    let k: keyof typeof room_memory_initializer
    for (k in room_memory_initializer) {
        if (!mem[k] || restart_room)
            room_memory_initializer[k](mem, obj)
    }
    for (k in mem) {
        if (!room_memory_initializer[k])
            delete mem[k]
    }
    return
}

export const room_memory_initializer: {
    [k in keyof Required<RoomMemory>]:
    (room_mem: RoomMemory, room_obj?: Room) => void
} = {
    spawns: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.spawns = {
            t0: [],
            t1: [],
            t2: [],
            t3: [],
        }
    },
    wall_hits: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.wall_hits = 100000
    },
    towers: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.towers = []
        if (!room_obj) return
        const towers: StructureTower[] = room_obj.find(FIND_MY_STRUCTURES, {
            filter: {structureType: STRUCTURE_TOWER}
        });
        for (let i in towers) {
            room_mem.towers.push(towers[i].id)
        }
    },
    links: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.links = {
            nexus: [],
            ins: [],
            outs: []
        }
        if (!room_obj) return
        const links: StructureLink[] = room_obj.find(FIND_MY_STRUCTURES, {
            filter: {structureType: STRUCTURE_LINK}
        });
        for (let link of links) {
            if (link.pos.findInRange(FIND_MY_STRUCTURES, 2, {filter: {structureType: STRUCTURE_STORAGE}}).length) {
                room_mem.links.nexus.push(link.id)
            } else if (link.pos.findInRange(FIND_SOURCES, 2).length) {
                room_mem.links.ins.push(link.id)
            } else room_mem.links.outs.push(link.id)
        }
    },
    labs: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.labs = {
            labs: {},
            target_res: {},
            boost_type: {},
            boost_lab: {},
            boost_amount: {}
        }
        if (!room_obj) return
        const labs: StructureLab[] = room_obj.find(FIND_MY_STRUCTURES, {
            filter: {structureType: STRUCTURE_LAB}
        });
        for (let i in labs) {
            const lab = labs[i]
            room_mem.labs.labs[lab.id] = {
                react_type: 'base',
                near_num: lab.pos.findInRange(FIND_MY_STRUCTURES, 2, {
                    filter: {structureType: STRUCTURE_LAB}
                }).length
            }
        }
    },
    factory: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.factory = {
            fact_id: null,
            reload_time: Game.time
        }
        if (!room_obj) return
        const factory = room_obj.find(FIND_MY_STRUCTURES, {
            filter: {structureType: STRUCTURE_FACTORY}
        })[0];
        if (factory instanceof StructureFactory)
            room_mem.factory.fact_id = factory.id
    },
    power_spawn: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.power_spawn = {
            power_spawn_id: null
        }
        if (!room_obj) return
        const power_spawn = room_obj.find(FIND_MY_STRUCTURES, {
            filter: {structureType: STRUCTURE_POWER_SPAWN}
        })[0];
        if (power_spawn instanceof StructurePowerSpawn)
            room_mem.power_spawn.power_spawn_id = power_spawn.id
    },
    nuker: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.nuker = {
            nuker_id: null
        }
        if (!room_obj) return
        const nuker = room_obj.find(FIND_MY_STRUCTURES, {
            filter: {structureType: STRUCTURE_NUKER}
        })[0];
        if (nuker instanceof StructureNuker)
            room_mem.nuker.nuker_id = nuker.id
    },
    observer: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.observer = {
            start_time: 0,
            ob_id: null,
            observing: null,
            BFS_open: []
        }
        if (!room_obj) return
        const observer = room_obj.find(FIND_MY_STRUCTURES, {
            filter: {structureType: STRUCTURE_OBSERVER}
        })[0];
        if (observer instanceof StructureObserver)
            room_mem.observer.ob_id = observer.id
    }
}
_.assign(global, {room_memory_initializer: room_memory_initializer})