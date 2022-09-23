import _ from "lodash"

/**
 * 格式化房间为指定房间类型
 * @param room_name 房间名
 * @param type 房间类型
 */
export const _format_room = function (room_name: string, type:RoomTypes, spawn_room: string) {
    Memory.rooms[room_name] = {
        _typed:{
            _type:      'neutral',
            _static:    {},
            _looper:    {Observe: {
                reload_time: Game.time,
                interval: 1500,
            }}
        },
        _dynamic: {},
        _spawn: room_name
    }
    Memory.rooms[room_name]._spawn = spawn_room
    Memory.rooms[room_name]._typed._type = type
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
    if(!Memory.rooms[room_name]?._typed?._type) {
        Memory.rooms[room_name] = {
            _typed:{
                _type:      'neutral',
                _static:    {},
                _looper:    {Observe: {
                    reload_time: Game.time,
                    interval: 1500,
                }}
            },
            _dynamic: {},
            _spawn: room_name
        }
    }
    const mem = Memory.rooms[room_name]
    switch(mem._typed._type){
        case 'neutral':
            return
        case 'owned': {
            let k: keyof typeof owned_memory_initializer
            for(k in owned_memory_initializer){
                if(!mem._typed[k] || restart_room)
                owned_memory_initializer[k](mem._typed)
            }
            return
        }
        case 'reserved': {
            let k: keyof typeof reserved_memory_initializer
            for(k in reserved_memory_initializer){
                if(!mem._typed[k] || restart_room)
                reserved_memory_initializer[k](mem._typed)
            }
            return
        }
        case 'highway': {
            let k: keyof typeof highway_memory_initializer
            for(k in highway_memory_initializer){
                if(!mem._typed[k] || restart_room)
                highway_memory_initializer[k](mem._typed)
            }
            return
        }
    }
}

const owned_memory_initializer: {[k in keyof FilterOptional<OwnedRoomMemory>]:
    (mem: OwnedRoomMemory) => void
} = {
    _type: function (mem: OwnedRoomMemory): void {
        mem._type = 'owned'
    },
    _looper: function (mem: OwnedRoomMemory) {
        const spawn_loop: Looper = {
            reload_time: Game.time,
            interval: 1500,
        }
        mem._looper = {
            Supplier: spawn_loop,
            Source0: spawn_loop,
            Source1: spawn_loop,
            Collector: spawn_loop,
            Maintain: spawn_loop,
            Mineral: spawn_loop,
            Upgrade: spawn_loop,
            Build: spawn_loop,
            Observe: spawn_loop
        }
    },
    _static: function (mem: OwnedRoomMemory): void {
        mem._static = {
            H_srcs: [],
            T_src0: [],
            T_src1: [],
            H_mnrl: [],
            T_mnrl: [],

            W_ctrl: [],
            U_ctrl: [],
            W_cntn: [],
            T_cntn: [],
        }
    },
    _struct: function (mem: OwnedRoomMemory): void {
        mem._struct = {
            spawns: {
                t0: [],
                t1: [],
                t2: [],
                t3: [],
            },
            towers: [],
            links: {
                nexus: [],
                ins: [],
                outs: []
            },
            labs: {
                ins: [],
                outs: [],
                reaction: null,
                boosts: []
            },
            wall_hits: 100000,

            factory: null,
            power_spawn: null,
            nuker: null,
            observer: {
                ob_id:      null,
                observing:  null,
                BFS_open:   []
            },
        }
    }
}

const reserved_memory_initializer: {[k in keyof FilterOptional<ReservedRoomMemory>]:
    (mem: ReservedRoomMemory) => void
} = {
    _type: function (mem: ReservedRoomMemory): void {
        mem._type = 'reserved'
    },
    _static: function (mem: ReservedRoomMemory): void {
        mem._static = {
            H_srcs: [],
            T_src0: [],
            T_src1: [],
            T_src2: [],

            W_cntn: [],
            T_cntn: [],
            A_core: [],
            A_ctrl: [],
            R_ctrl: [],
        }
    },
    _looper: function (mem: ReservedRoomMemory): void {
        const spawn_loop: Looper = {
            reload_time: Game.time,
            interval: 1500,
        }
        mem._looper = {
            Reserve: spawn_loop,
            Source0: spawn_loop,
            Source1: spawn_loop,
            Build: spawn_loop,
            Maintain: spawn_loop,
            Collector: spawn_loop,
            Observe: spawn_loop
        }
    }
}

const highway_memory_initializer: {[k in keyof FilterOptional<HighwayRoomMemory>]:
    (mem: HighwayRoomMemory) => void
} = {
    _type: function (mem: HighwayRoomMemory): void {
        mem._type = 'highway'
    },
    _static: function (mem: HighwayRoomMemory): void {
        mem._static = {
            A_bank: [],
        }
    },
    _looper: function (mem: HighwayRoomMemory): void {
        const spawn_loop: Looper = {
            reload_time: Game.time,
            interval: 1500,
        }
        mem._looper = {
            Deposit: spawn_loop,
            Collector: spawn_loop,
            Observe: spawn_loop
        }
    }
}