import { structure_updater } from "./room/structure.updater";
import { operator_run } from "./power_creep/operator";
import { body_generator } from "./creep/config.body";
import { inspector_memory } from "./room/memory.inspector";
import { spawn_loop } from "./creep/handler.spawn";
import { spawn_run } from "./structure/spawn";
import { tower_run } from "./structure/tower";
import { perform_any } from "./performer/behavior.any";
import { static_updater } from "./scanner/static";

export const loop = function () {

    if(false){
        static_updater
        structure_updater
        body_generator
    }
    
    //ROOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOMS
    if(!Memory.owned_rooms)
        Memory.owned_rooms = []
    for(let name of Memory.owned_rooms){
        try{
            const room = Game.rooms[name];
            if(!room)continue
            inspector_memory(room)
            spawn_loop(room)
            spawn_run(room)
            tower_run(room)
        }catch(error){
            console.log(name +':' + error);
        }
    }

    //CREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEPS
    for(var name in Memory.creeps) {
        try{
            const creep = Game.creeps[name]
            if(!creep){
                delete Memory.creeps[name];
                continue
            }
            if(creep.spawning)
                continue
            if(creep.memory.behavior)
                perform_any(creep,creep.memory.behavior)
        }catch(error){
            console.log(name + ':' + error + '');
        }
    }

    //POOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOWWWWWWWEEEEEEEERRRRRRRRR
    for(var name in Game.powerCreeps){
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
            console.log(name + ':' + error);
        }
    }
}
