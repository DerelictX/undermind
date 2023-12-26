import {_format_room} from "./room/memory.inspector";
import {inspect_global} from "./global/memory.inspector";
import {handle_moves} from "./move/Kuhn-Munkres";
import {HelperRoomResource} from "./global/helper_roomResource";
import {expand_commo} from "./constant/commodity_tree";
import {run_rooms} from "./run_rooms";
import {run_creeps, run_power_creeps} from "./run_creeps";
import {loop_objects} from "./controller/loopObjects";
import {loop_rooms} from "./controller/loopRooms";

export const loop = function () {

    if (false) {
        _format_room
        HelperRoomResource.showAllRes()
        expand_commo
        Game.market.createOrder({type: 'buy', resourceType: 'pixel', price: 0.001, totalAmount: 1, roomName: 'sim'})
        //Memory.terminal.demand['X']['E41S51'] = 60000
    }

    if (!global._collect) global._collect = {}
    if (!global._consume) global._consume = {}
    if (!global.commonMatrix) global.commonMatrix = {}
    global._move_intents = {}

    inspect_global()
    loop_rooms()
    loop_objects()

    run_rooms()
    run_power_creeps()
    run_creeps()
    handle_moves()

    if (Game.time % 32 == 0) {
        for (let name in Memory._closest_owned) {
            const node = Memory._closest_owned[name]
            if (!node) continue
            if (node.time < Game.time + 4000) {
                delete Memory._closest_owned[name]
                continue
            }
            const color = Memory.threat_level[name] ? '#FF4020' : '#9FFF10'
            Game.map.visual.line(
                new RoomPosition(25, 25, node.prev),
                new RoomPosition(25, 25, name), {color: color, width: 1, opacity: 0.3});
            Game.map.visual.text('' + node.dist,
                new RoomPosition(25, 25, name), {color: '#9F7FFF', fontSize: 15});
        }
        Memory.visual = Game.map.visual.export()
    } else {
        Game.map.visual.import(Memory.visual)
    }

    if (Game.shard.name == 'shard2')
        Game.cpu.generatePixel()
}
