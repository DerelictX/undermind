const inspector_memory = function (room: Room) {
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
            //wallHits += room.controller.level * room.controller.level * 100000
        }
        room.memory.structures = {
            factory: null,
            power_spawn: null,
            nuker: null,
            observer: null,
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
    spawn: function (room: Room) {
        const spawn_loop: RoleSpawnLoop = {
            succeed_time: Game.time + 50,
            succ_interval: 1500,
            body_parts: [],
            boost_queue: [],
            queued: 0
        }
        room.memory.spawn = {
            pioneer: spawn_loop,
            builder: spawn_loop,
            maintainer: spawn_loop,
            fortifier: spawn_loop,

            harvester_m: spawn_loop,
            harvester_s0: spawn_loop,
            harvester_s1: spawn_loop,
            upgrader_s: spawn_loop,
            reserver: spawn_loop,

            supplier: spawn_loop,
            collector: spawn_loop,
            emergency: spawn_loop,

            healer: spawn_loop,
            melee: spawn_loop,
            ranged: spawn_loop,
        }
    },
    _consume: function (room: Room): void {
        room.memory._consume = {}
    },
    _supply: function (room: Room): void {
        room.memory._supply = {}
    },
    _static: function (room: Room): void {
        room.memory._static = {}
    }
}
