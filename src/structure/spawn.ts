import { body_generator, default_body_config } from "@/creep/body_config";

export const spawn_run = function(room: Room) {
    if(room.energyAvailable < 300)
        return
    const spawn = room.find(FIND_MY_SPAWNS).find(spawn => !spawn.spawning)
    if(!spawn)return

    let role_name: AnyRoleName
    for(role_name in room.memory.spawn_loop){
        const spawn_loop = room.memory.spawn_loop[role_name]
        if(spawn_loop.queued == 1){
            let body_parts = spawn_loop.body_parts
            const creep_name = default_body_config[role_name].generator
                +'_'+ room.name +'_'+ Game.time%10000
            
            let ret = spawn.spawnCreep(body_parts, creep_name)
            if(ret == ERR_NOT_ENOUGH_ENERGY || ret == ERR_INVALID_ARGS){
                const generator = body_generator[default_body_config[role_name].generator]
                body_parts = generator(room.energyAvailable,default_body_config[role_name].workload)
                ret = spawn.spawnCreep(body_parts, creep_name)
            }
            if(ret == OK){
                room.memory.spawn_loop[role_name].queued = 0
                room.memory.spawn_loop[role_name].succeed_time = Game.time
                    + spawn_loop.succ_interval + 10
                    
                const class_memory = init_class_memory(role_name)
                if(class_memory) Memory.creeps[creep_name] = {
                    class_memory:   class_memory,
                    spawn_room:     room.name,
                    resource_room:  room.name,
                    target_room:    room.name,
                    boost_queue:    []
                }
                return
            } else {
                console.log(spawn.name+":"+creep_name+":"+ret)
            }
        }
    }
}

const init_class_memory = function(role_name: AnyRoleName): AnyClassMemory|undefined{
    switch(role_name){
        case 'harvester_m':
        case 'harvester_s0':
        case 'harvester_s1':
        case 'upgrader_s':
        case 'reserver':
            return {
                class:  'specialist',
                role:   role_name
            }
        case 'builder':
        case 'maintainer':
        case 'fortifier':
        case 'pioneer':
            return {
                class:  'generalist',
                role:   role_name,
                state:  'obtain'
            }
        case 'supplier':
        case 'collector':
        case 'emergency':
            return {
                class:  'carrier',
                role:   role_name,
                state:  'collect',
                collect:    [],
                supply:     []
            }
        case 'healer':
        case 'ranged':
        case 'melee':
            return {
                class:  'fighter',
                role:   role_name
            }
        default:
            return undefined
    }
}