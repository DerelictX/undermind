export const inspector_memory = function (room: Room) {
    var k: keyof RoomMemory
    for(k in memory_inspector){
        if(!room.memory[k])
        memory_inspector[k](room)
    }
}

const memory_inspector: {[k in keyof RoomMemory]:
    (room: Room) => void
} = {
    structures: function (room: Room) {
        let wallHits = 100000
        if (room.controller) {
            wallHits += room.controller.level * 100000
        }
        room.memory.structures = {
            towers: [],
            links: {
                nexus: [],
                ins: [],
                outs: []
            },
            containers: {
                ins: [],
                outs: []
            },
            labs: {
                ins: [],
                outs: [],
                reaction: null,
                boosts: []
            },
            wall_hits: wallHits
        }
    },
    _spawn: function (room: Room) {
        const spawn_loop: RoleSpawnLoop = {
            reload_time: Game.time + 10,
            interval: 1500,
            body_parts: [],
            boost_queue: [],
            queued: 0
        }
        room.memory._spawn = {
            HarvesterSource0:   spawn_loop,
            HarvesterSource1:   spawn_loop,
            HarvesterSource2:   spawn_loop,
            HarvesterMineral:   spawn_loop,
            Upgrader:           spawn_loop,
            HarvesterDeposit:   spawn_loop,
            Builder:            spawn_loop,
            Maintainer:         spawn_loop,
            Collector:          spawn_loop,
            Supplier:           spawn_loop,
            Chemist:            spawn_loop
        }
    },
    _collect: function (room: Room): void {
        room.memory._collect = {}
    },
    _consume: function (room: Room): void {
        room.memory._consume = {}
    },
    _static: function (room: Room): void {
        room.memory._static = {}
    },
}
