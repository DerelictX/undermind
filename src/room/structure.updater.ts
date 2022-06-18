import _ from "lodash";

export const structure_updater = {

    all: function(room:Room) {
        this.containers(room)
        this.towers(room)
        this.links(room)
        this.labs(room)
        this.unique(room)
    },

    unique: function(room:Room) {
        //factory
        room.memory.structures.factory = null
        const factory = room.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_FACTORY}
        })[0];
        if(factory instanceof StructureFactory)
            room.memory.structures.factory = factory.id

        //nuker
        room.memory.structures.nuker = null
        const nuker = room.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_NUKER}
        })[0];
        if(nuker instanceof StructureNuker)
            room.memory.structures.nuker = nuker.id

        //power_spawn
        room.memory.structures.power_spawn = null
        const power_spawn = room.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_POWER_SPAWN}
        })[0];
        if(power_spawn instanceof StructurePowerSpawn)
            room.memory.structures.power_spawn = power_spawn.id
        else room.memory.structures.power_spawn = null

        //observer
        room.memory.structures.observer = null
        const observer = room.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_OBSERVER}
        })[0];
        if(observer instanceof StructureObserver)
            room.memory.structures.observer = observer.id
        else room.memory.structures.observer = null
    },

    containers: function(room:Room){
        room.memory.structures.containers.ins = []
        room.memory.structures.containers.outs = []
        const containers:StructureContainer[] = room.find(FIND_STRUCTURES,{
            filter: {structureType: STRUCTURE_CONTAINER}
        });

        for(let container of containers){
            if(container.pos.findInRange(FIND_SOURCES,2)){
                room.memory.structures.containers.ins.push(container.id)
            } else room.memory.structures.containers.outs.push(container.id)
        }
    },

    links: function(room:Room){
        room.memory.structures.links.nexus = []
        room.memory.structures.links.ins = []
        room.memory.structures.links.outs = []
        const links:StructureLink[] = room.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_LINK}
        });

        for(let link of links){
            if(link.pos.findInRange(FIND_STRUCTURES,2,{filter: {structureType: STRUCTURE_STORAGE}})){
                room.memory.structures.links.nexus.push(link.id)
            } else if(link.pos.findInRange(FIND_SOURCES,2)){
                room.memory.structures.links.ins.push(link.id)
            } else room.memory.structures.links.outs.push(link.id)
        }
    },

    labs: function(room:Room){
        room.memory.structures.labs.ins = []
        room.memory.structures.labs.outs = []
        const labs:StructureLab[] = room.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_LAB}
        });
    
        var near_num:number[] = []
        for(let i in labs){
            const lab = labs[i]
            near_num[i] = lab.pos.findInRange(FIND_MY_STRUCTURES,2,{
                filter: {structureType: STRUCTURE_LAB}
            }).length;
        }
    
        for(let i in labs){
            if(labs.length > 3 && near_num[i] == labs.length && room.memory.structures.labs.ins.length < 2)
                room.memory.structures.labs.ins.push(labs[i].id)
            else room.memory.structures.labs.outs.push(labs[i].id)
        }
    },

    towers: function(room:Room){
        room.memory.structures.towers = []
        const towers:StructureTower[] = room.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_TOWER}
        });
        for(let i in towers){
            room.memory.structures.towers.push(towers[i].id)
        }
    }
}
_.assign(global, {structure_updater:structure_updater})