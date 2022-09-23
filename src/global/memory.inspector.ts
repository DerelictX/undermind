export const inspect_global = function(){
    let k: keyof typeof global_memory_initializer
    for(k in global_memory_initializer){
        if(!Memory[k])
            global_memory_initializer[k]()
    }
    for(k in Memory){
        if(!global_memory_initializer[k])
            delete Memory[k]
    }
    return
}

const global_memory_initializer: { [k in keyof FilterOptional<Memory>]: () => void } = {
    username: function (): void {
        for (const name in Game.spawns) {
            const spawn = Game.spawns[name]
            Memory.username = spawn.owner.username
            return
        }
    },
    creep_SN: function (): void {
        Memory.creep_SN = 1
    },
    terminal: function (): void {
        Memory.terminal = { supply: {}, demand: {} }
    },
    threat_level: function (): void {
        Memory.threat_level = {}
    },

    _move_intents: function (): void {
        Memory._move_intents = {}
    },
    commonMatrix: function (): void {
        Memory.commonMatrix = {}
    },
    squardMatrix: function (): void {
        Memory.squardMatrix = {}
    },
    _edge_exits: function (): void {
        Memory._edge_exits = {}
    },
    _closest_owned: function (): void {
        Memory._closest_owned = {}
    },

    creeps: function (): void { },
    powerCreeps: function (): void { },
    flags: function (): void { },
    rooms: function (): void { },
    spawns: function (): void { },
}