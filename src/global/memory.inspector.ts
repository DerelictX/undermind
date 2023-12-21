import {product_tier} from "@/constant/resource_series"
import {inspect_memory} from "@/room/memory.inspector"
import _, {ceil} from "lodash"

export const _reboot_all = function () {
    for (let name in Game.rooms) {
        if (Game.rooms[name].controller?.my)
            inspect_memory(name, true)
    }
}
_.assign(global, {_reboot_all: _reboot_all})

export const inspect_global = function () {
    let k: keyof typeof global_memory_initializer
    for (k in global_memory_initializer) {
        if (!Memory[k])
            global_memory_initializer[k]()
    }
    for (k in Memory) {
        if (!global_memory_initializer[k])
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
        Memory.terminal = {
            demand: {},
            overflow: []
        }
    },
    threat_level: function (): void {
        Memory.threat_level = {}
    },

    _edge_exits: function (): void {
        Memory._edge_exits = {}
    },
    _closest_owned: function (): void {
        Memory._closest_owned = {}
    },

    creeps: function (): void {
        Memory.creeps = {}
    },
    powerCreeps: function (): void {
        Memory.powerCreeps = {}
    },
    flags: function (): void {
        Memory.flags = {}
    },
    rooms: function (): void {
        Memory.rooms = {}
    },
    spawns: function (): void {
        Memory.spawns = {}
    },
    factory: function (): void {
        Memory.factory = {
            demand: [{}]
        }
        const demand0 = {
            energy: 3000, battery: 500,
            ghodium_melt: 500, purifier: 500, oxidant: 500, reductant: 500,
            zynthium_bar: 500, lemergium_bar: 500, utrium_bar: 500, keanium_bar: 500,
            metal: 1000, biomass: 1000, silicon: 1000, mist: 1000,
        }
        Memory.factory.demand[0] = {...demand0}
        //高级商品
        for (let level = 1; level <= 5; level++) {
            Memory.factory.demand[level] = {...demand0}
            const demand = Memory.factory.demand[level]
            for (let product of product_tier[level]) {
                const times_kt = ceil(1000 / COMMODITIES[product].cooldown) //1000tick能合成的次数
                const components = COMMODITIES[product].components
                let component: keyof typeof components
                for (component in components) {
                    if ((demand[component] ?? 0) < components[component] * times_kt)
                        demand[component] = components[component] * times_kt
                }
            }
        }
    },
    room_type: function (): void {
        Memory.room_type = {}
        for (let name in Game.rooms) {
            if (Game.rooms[name].controller?.my)
                Memory.room_type[name] = 'owned'
        }
    },
    _loop_id: function (): void {
        Memory._loop_id = {}
    },
    _loop_room: function (): void {
        Memory._loop_room = {}
    },
    _loop_flag: function (): void {
        Memory._loop_flag = {}
    },
    H_srcs: function (): void {
        Memory.H_srcs = {}
    },
    W_cntn: function (): void {
        Memory.W_cntn = {}
    },
    T_cntn: function (): void {
        Memory.T_cntn = {}
    }
}