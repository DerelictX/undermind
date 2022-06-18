
import { lab_run } from "./structure/lab";
import { tower_run } from "./structure/tower";
import { death_detect } from "./creep/death_detect";
import { spawn_run } from "./structure/spawn";
import { power_spawn_run } from "./structure/power_spawn";
import { structure_updater } from "./room/structure.updater";
import { operator_run } from "./power_creep/operator";
import { spawn_loop } from "./room/spawn_loop";
import { body_generator } from "./creep/body_config";
import { link_run } from "./structure/link";
import { perform_any } from "./behaviour/combinative.performer";

export const loop = function () {

    if(false){
        structure_updater
        body_generator
    }
    //Memory.owned_rooms = ['sim']
    //ROOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOMS
    for(let room_name of Memory.owned_rooms){
        const room = Game.rooms[room_name];
        if(!room)continue
        try{
            inspector_memory(room)
                
            spawn_loop(room)
            spawn_run(room)
            tower_run(room)
            link_run(room)
            lab_run(room)
            power_spawn_run(room)
        }catch(error){
            console.log(room.name +':' + error);
        }
    }

    //CREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEPS
    for(var name in Game.creeps) {
        if(Game.cpu.getUsed() > 18)
            break
        try{
            const creep = Game.creeps[name];
            if(creep.spawning)
                continue
            
            const cpu = Game.cpu.getUsed()
            if(creep.memory.behavior)
                perform_any(creep,creep.memory.behavior)
                
            const cpv = Game.cpu.getUsed() - cpu
            if(cpv > 1){
                //console.log(creep.memory.class_memory.role + ':\t' + cpv);
            }
                
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
    
    try{
        death_detect()
        //terminal_run()
        //Game.cpu.generatePixel();
    }catch(error){
        console.log(':' + error);
    }

}
