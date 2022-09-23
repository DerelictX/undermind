import { structure_updater } from "./scanner/structure.updater";
import { operator_run } from "./power_creep/operator";
import { inspect_memory, _format_room } from "./room/memory.inspector";
import { spawn_loop } from "./room/handler.spawn";
import { spawn_run } from "./structure/spawn";
import { tower_run } from "./structure/tower";
import { static_updater } from "./scanner/static";
import { link_run } from "./structure/link";
import { perform_callback } from "./performer/behavior.callback";
import { lab_run } from "./structure/lab";
import { terminal_run } from "./structure/terminal";
import { factory_run } from "./structure/factory";
import { power_spawn_run } from "./structure/power_spawn";
import { run_carrier } from "./role/driver/carrier";
import { observer_run } from "./structure/observer";
import { run_worker } from "./role/driver/worker";
import { inspect_global } from "./global/memory.inspector";
import { handle_moves } from "./move/Kuhn-Munkres";

export const loop = function () {

    if(false){
        static_updater
        structure_updater
        _format_room
    }
    
    inspect_global()
    run_rooms()
    run_creeps()
    run_power_creeps()
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
    if(Game.time % 20 == 3){
        terminal_run()
    }
    if(Game.shard.name == 'shard2')
        Game.cpu.generatePixel()
}

const run_rooms = function(){
    Memory._move_intents = {}
    for(let name in Memory.rooms){
        try{
            const room = Game.rooms[name];
            if(!room){
                continue
            }
            spawn_loop(room)
            spawn_run(room)
            tower_run(room)
            link_run(room)

            lab_run(room)
            factory_run(room)
            power_spawn_run(room)
            observer_run(room)
        }catch(error){
            console.log(name +':\t' + error);
            inspect_memory(name,false)
        }
    }
}

const run_creeps = function(){
    for(let name in Memory.creeps) {
        try{
            const creep = Game.creeps[name]
            if(!creep){
                delete Memory.creeps[name];
                continue
            }
            if(creep.spawning) continue
            if(Game.cpu.bucket < 8000 && Game.cpu.getUsed() > 18) return

            const _class = creep.memory._class
            switch(_class.bhvr_name){
                case 'carrier':
                    run_carrier(creep,_class)
                    break
                case 'worker':
                    run_worker(creep,_class)
                    break
                case 'callbackful':
                    perform_callback(creep,_class)
                    break
                default: throw new Error("Unexpected state.")
            }
        }catch(error){
            console.log(name + ':\t' + error);
            throw(error)
        }
    }
}

const run_power_creeps = function(){
    for(let name in Game.powerCreeps){
        try{
            const powerCreep = Game.powerCreeps[name]
            if(!powerCreep.shard)
                continue
            switch(powerCreep.className) {
                case 'operator':
                    operator_run(powerCreep);
                    break;
            }
        }catch(error){
            console.log(name + ':\t' + error);
        }
    }
}