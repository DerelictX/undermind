import { structure_updater } from "./room/structure.updater";
import { operator_run } from "./power_creep/operator";
import { inspector_memory, _format_room } from "./room/memory.inspector";
import { spawn_loop } from "./creep/handler.spawn";
import { spawn_run } from "./structure/spawn";
import { tower_run } from "./structure/tower";
import { static_updater } from "./scanner/static";
import { run_carrier } from "./creep/role.carrier";
import { run_worker } from "./creep/role.worker";
import { link_run } from "./structure/link";
import { perform_callback } from "./performer/behavior.callback";
import { lab_run } from "./structure/lab";

export const loop = function () {

    if(false){
        static_updater
        structure_updater
        _format_room
    }

    run_rooms()
    run_creeps()
    run_power_creeps()
}

const run_rooms = function(){
    for(let name in Memory.rooms){
        try{
            inspector_memory(name,false)
            const room = Game.rooms[name];
            if(!room){
                continue
            }
            spawn_loop(room)
            spawn_run(room)
            tower_run(room)
            link_run(room)

            lab_run(room)
        }catch(error){
            console.log(name +':\t' + error);
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