import { _format_room } from "./room/memory.inspector";
import { inspect_global } from "./global/memory.inspector";
import { handle_moves } from "./move/Kuhn-Munkres";
import { HelperRoomResource } from "./global/helper_roomResource";
import { expand_commo } from "./constant/commodity_tree";
import { run_rooms } from "./run_rooms";
import { run_creeps, run_power_creeps } from "./run_creeps";
import { loopHarvest } from "./controller/harvest";
import { loopRooms } from "./controller/owned";

export const loop = function () {

    if(false){
        _format_room
        HelperRoomResource.showAllRes()
        expand_commo
        Game.market.createOrder({ type:'buy', resourceType:'pixel', price:0.001, totalAmount:1, roomName:'sim' })
        //Memory.terminal.demand['X']['E41S51'] = 60000
    }
    
    if(!global._collect) global._collect = {}
    if(!global._consume) global._consume = {}
    if(!global.commonMatrix) global.commonMatrix = {}
    global._move_intents = {}

    inspect_global()
    loopRooms()
    loopHarvest()
    run_rooms()
    run_power_creeps()
    run_creeps()
    handle_moves()

    for(let name in Memory._closest_owned){
        const qwer = Memory._closest_owned[name]
        if(!qwer) continue
        const color = Memory.threat_level[name] ? '#FF0000' : '#FFFF00'
        Game.map.visual.line(
            new RoomPosition(25,25,qwer.prev),
            new RoomPosition(25,25,name), {color: color, width:1, opacity:0.3});
        Game.map.visual.text('' + qwer.dist,
            new RoomPosition(25,25,name), {color: '#FF0000', fontSize:15}); 
    }

    if(Game.shard.name == 'shard2')
        Game.cpu.generatePixel()
}
