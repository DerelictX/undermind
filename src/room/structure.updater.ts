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
        room.memory.structures.containers_in = []
        let sources: (Source|Mineral)[] = room.find(FIND_SOURCES)
        sources = sources.concat(room.find(FIND_MINERALS));
        for(let s in sources){
            let containers:StructureContainer[] = sources[s].pos.findInRange(FIND_STRUCTURES,2,{
                filter: {structureType: STRUCTURE_CONTAINER}
            });
            for(let i in containers){
                room.memory.structures.containers_in.push(containers[i].id)
            }
        }
        
        room.memory.structures.containers_out = []
        const controller = room.controller;
        if(controller){
            let containers:StructureContainer[] = controller.pos.findInRange(FIND_STRUCTURES,3,{
                filter: {structureType: STRUCTURE_CONTAINER}
            });
            for(let i in containers){
                room.memory.structures.containers_out.push(containers[i].id)
            }
        }
    },

    links: function(room:Room){
        room.memory.structures.links_in = []
        const sources = room.find(FIND_SOURCES);
        for(let s in sources){
            let links:StructureLink[] = sources[s].pos.findInRange(FIND_STRUCTURES,2,{
                filter: {structureType: STRUCTURE_LINK}
            });
            for(let i in links){
                room.memory.structures.links_in.push(links[i].id)
            }
        }

        room.memory.structures.link_nexus = []
        let storage: StructureStorage|StructureTerminal|undefined = room.storage;
        if(!storage || !storage.my) storage = room.terminal;
        if(storage){
            let links:StructureLink[] = storage.pos.findInRange(FIND_MY_STRUCTURES,2,{
                filter: {structureType: STRUCTURE_LINK}
            });
            for(let i in links){
                room.memory.structures.link_nexus.push(links[i].id)
            }
        }

        room.memory.structures.links_out = []
        const controller = room.controller;
        if(controller){
            let link:StructureLink|null = controller.pos.findClosestByRange(FIND_MY_STRUCTURES,{
                filter: {structureType: STRUCTURE_LINK}
            });
            if(link && link.pos.inRangeTo(controller,3))
                room.memory.structures.links_out.push(link.id)
        }

    },

    labs: function(room:Room){
        room.memory.structures.labs_in = []
        room.memory.structures.labs_out = []
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
            if(labs.length >= 6 && near_num[i] == labs.length && room.memory.structures.labs_in.length < 2)
                room.memory.structures.labs_in.push(labs[i].id)
            else room.memory.structures.labs_out.push(labs[i].id)
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