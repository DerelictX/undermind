export const inspector_memory = function (room: Room) {
    switch(room.memory._typed._type){
        case 'owned':
            let k: keyof OwnedRoomMemory
            for(k in memory_inspector){
                if(!room.memory._typed[k])
                memory_inspector[k](room.memory._typed)
            }
            return
    }
}

const memory_inspector: {[k in keyof OwnedRoomMemory]:
    (mem: OwnedRoomMemory) => void
} = {
    _type: function (mem: OwnedRoomMemory): void {
        mem._type = 'owned'
    },
    _looper: function (mem: OwnedRoomMemory) {
        const spawn_loop: Looper = {
            reload_time: Game.time + 10,
            interval: 1500,
        }
        mem._looper = {
            HarvesterSource0: spawn_loop,
            HarvesterSource1: spawn_loop,
            HarvesterMineral: spawn_loop,
            Upgrader: spawn_loop,
            Builder: spawn_loop,
            Maintainer: spawn_loop,
            EnergySupplier: spawn_loop,
            Collector: spawn_loop,
            Supplier: spawn_loop,
            Chemist: spawn_loop
        }
    },
    _spawn: function (mem: OwnedRoomMemory) {
        mem._spawn = []
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
            observer: null,
        }
    }
}
