export const fighter_run = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'fighter')
        return

    role_performers[creep.memory.class_memory.role](creep)
}

const squad_runner = function(squad: Creep[]){
    const melee = squad[0]
    const healer = squad[1]
}

const role_performers = {
    healer(creep:Creep){
        if(creep.memory.boost_queue.length){
            gofor_boost(creep)
            return
        }
        creep.heal(creep)
        if(Game.flags['he'])
            creep.moveTo(Game.flags['he'],{reusePath:50})
        creep.rangedMassAttack()
    },
    ranged(creep:Creep){

    },
    melee(creep:Creep){

    },
}

export const gofor_boost = function(creep:Creep){
    const boostType = creep.memory.boost_queue[0].boost
    const partType = creep.memory.boost_queue[0].part
    const lab:StructureLab[] = creep.room.find(FIND_MY_STRUCTURES,{
        filter: lab => lab.structureType == STRUCTURE_LAB
            && lab.store[boostType] >= creep.getActiveBodyparts(partType) * 30
    })
    if(!lab[0]){
        creep.memory.boost_queue.shift()
    } else {
        const ret = lab[0].boostCreep(creep)
        if(ret == ERR_NOT_IN_RANGE) creep.moveTo(lab[0])
        else creep.memory.boost_queue.shift()
    }
}