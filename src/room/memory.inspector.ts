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
    _spawn: function (room: Room) {
        const spawn_loop: RoleSpawnLoop = {
            reload_time: Game.time + 20,
            interval: 400,
            body_parts: [],
            boost_queue: [],
            queued: 0
        }
        room.memory._spawn = {
            generalist: spawn_loop,
            specialist: spawn_loop,
            carrier:    spawn_loop,
            fighter:    spawn_loop
        }
    },
    _consume: function (room: Room): void {
        room.memory._consume = {}
    },
    _supply: function (room: Room): void {
        room.memory._supply = {}
    },
    _static: function (room: Room): void {
        room.memory._static = {
            source:     [],
            mineral:    [],
            upgrade:    [],
            reserve:    [],
            siege:      []
        }
    }
}
