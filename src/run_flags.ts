import {loop_flags} from "@/controller/loopFlags";
import {hikeTo} from "@/move/single_creep/route";
import _ from "lodash";
import {crawlSquad} from "@/move/squad/virtualPosition";
import {base64table} from "@/move/Kuhn-Munkres";

export const run_flags = function () {
    for (let name in Memory.flags) {
        try {
            const flag = Game.flags[name]
            if (!flag) continue
            loop_flags(flag)
        } catch (error) {
            console.log(name + ':\t' + error);
        }
    }
}

export const init_loop_flag = function (name: string, key: AnyLoopType) {
    Memory.flags[name] = {
        _loop: {
            _loop_type: key, _time: 0, interval: 1500
        }
    }
}
_.assign(global, {init_loop_flag: init_loop_flag})

export const init_room_flag = function (room: Room) {
    if (!room.controller?.my) return
    const sources = room.find(FIND_SOURCES)
    for (let i in sources) {
        const source = sources[i]
        const flag_name = room.name + '_source' + i
        if (!Game.flags[flag_name]) {
            init_loop_flag(flag_name, '_source')
            room.createFlag(source.pos, flag_name)
        }
    }
    const roles: AnyLoopType[] = [
        '_supply', '_collect', '_chemist',
        '_maintain', '_upgrade', '_fortify',
        '_observe'
    ]
    for (const role of roles) {
        const flag_name = room.name + role
        if (!Game.flags[flag_name]) {
            room.createFlag(room.controller.pos, flag_name)
        }
        if (!Memory.flags[flag_name]) {
            init_loop_flag(flag_name, role)
        }
    }
}
_.assign(global, {init_room_flag: init_room_flag})
