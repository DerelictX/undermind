import _ from "lodash"

/**
 * 格式化房间为指定房间类型
 * @param room_name 房间名
 * @param type 房间类型
 */
export const _format_room = function (room_name: string, type:RoomTypes, spawn_room: string) {
    delete Memory.rooms[room_name]
    inspect_memory(room_name,true)
}
_.assign(global, {_format_room:_format_room})

/**
 * 房间内存完整性检查和补全
 * @param room_name 房间名
 * @param restart_room 是否重置房间
 * @returns 
 */
export const inspect_memory = function (room_name: string, restart_room: boolean = false) {
    const mem = Memory.rooms[room_name] ?? (Memory.rooms[room_name] = {})
    const obj = Game.rooms[room_name] ?? undefined
    if(restart_room){
        console.log('restart_room\t' + room_name)
    }
    let k: keyof typeof room_memory_initializer
    for(k in room_memory_initializer){
        if(!mem[k] || restart_room)
            room_memory_initializer[k](mem,obj)
    }
    for(k in mem){
        if(!room_memory_initializer[k])
            delete mem[k]
    }
    return
}

const room_memory_initializer: {[k in keyof Required<RoomMemory>]:
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
        if(!room_obj) return
        const towers:StructureTower[] = room_obj.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_TOWER}
        });
        for(let i in towers){
            room_mem.towers.push(towers[i].id)
        }
    },
    links: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.links = {
            nexus: [],
            ins: [],
            outs: []
        }
        if(!room_obj) return
        const links:StructureLink[] = room_obj.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_LINK}
        });
        for(let link of links){
            if(link.pos.findInRange(FIND_MY_STRUCTURES,2,{filter: {structureType: STRUCTURE_STORAGE}}).length){
                room_mem.links.nexus.push(link.id)
            } else if(link.pos.findInRange(FIND_SOURCES,2).length){
                room_mem.links.ins.push(link.id)
            } else room_mem.links.outs.push(link.id)
        }
    },
    labs: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.labs = {
            ins: [],
            outs: [],
            reaction: null,
            boosts: []
        }
        if(!room_obj) return
        const labs:StructureLab[] = room_obj.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_LAB}
        });
        var near_num:number[] = []
        for(let i in labs){
            const lab = labs[i]
            near_num[i] = lab.pos.findInRange(FIND_MY_STRUCTURES,2,{
                filter: {structureType: STRUCTURE_LAB}
            }).length;
        }
        for(let i in labs){
            if(labs.length > 3 && near_num[i] == labs.length && room_mem.labs.ins.length < 2)
                room_mem.labs.ins.push(labs[i].id)
            else room_mem.labs.outs.push(labs[i].id)
        }
    },
    factory: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.factory = {
            fact_id: null,
            reload_time: Game.time,
            interval: 1000
        }
        if(!room_obj) return
        const factory = room_obj.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_FACTORY}
        })[0];
        if(factory instanceof StructureFactory)
            room_mem.factory.fact_id = factory.id
    },
    power_spawn: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.power_spawn = null
        if(!room_obj) return
        const power_spawn = room_obj.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_POWER_SPAWN}
        })[0];
        if(power_spawn instanceof StructurePowerSpawn)
            room_mem.power_spawn = power_spawn.id
    },
    nuker: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.nuker = null
        if(!room_obj) return
        const nuker = room_obj.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_NUKER}
        })[0];
        if(nuker instanceof StructureNuker)
            room_mem.nuker = nuker.id
    },
    observer: function (room_mem: RoomMemory, room_obj?: Room): void {
        room_mem.observer = {
            ob_id: null,
            observing: null,
            BFS_open: []
        }
        if(!room_obj) return
        const observer = room_obj.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_OBSERVER}
        })[0];
        if(observer instanceof StructureObserver)
            room_mem.observer.ob_id = observer.id
    }
}