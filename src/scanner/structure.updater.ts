import _ from "lodash";

export const structure_updater = {

    unique: function(room:Room,pool:RoomStructureList) {
        //factory
        pool.factory = null
        const factory = room.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_FACTORY}
        })[0];
        if(factory instanceof StructureFactory)
            pool.factory = factory.id

        //nuker
        pool.nuker = null
        const nuker = room.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_NUKER}
        })[0];
        if(nuker instanceof StructureNuker)
            pool.nuker = nuker.id

        //power_spawn
        pool.power_spawn = null
        const power_spawn = room.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_POWER_SPAWN}
        })[0];
        if(power_spawn instanceof StructurePowerSpawn)
            pool.power_spawn = power_spawn.id
        else pool.power_spawn = null

        //observer
        pool.observer = {
            ob_id:      null,
            observing:  null,
            BFS_open:   []
        }
        const observer = room.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_OBSERVER}
        })[0];
        if(observer instanceof StructureObserver)
            pool.observer.ob_id = observer.id
    },

    links: function(room:Room,pool:RoomStructureList){
        pool.links.nexus = []
        pool.links.ins = []
        pool.links.outs = []
        const links:StructureLink[] = room.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_LINK}
        });

        for(let link of links){
            if(link.pos.findInRange(FIND_MY_STRUCTURES,2,{filter: {structureType: STRUCTURE_STORAGE}}).length){
                pool.links.nexus.push(link.id)
            } else if(link.pos.findInRange(FIND_SOURCES,2).length){
                pool.links.ins.push(link.id)
            } else pool.links.outs.push(link.id)
        }
    },

    labs: function(room:Room,pool:RoomStructureList){
        pool.labs.ins = []
        pool.labs.outs = []
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
            if(labs.length > 3 && near_num[i] == labs.length && pool.labs.ins.length < 2)
                pool.labs.ins.push(labs[i].id)
            else pool.labs.outs.push(labs[i].id)
        }
    },

    towers: function(room:Room,pool:RoomStructureList){
        pool.towers = []
        const towers:StructureTower[] = room.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_TOWER}
        });
        for(let i in towers){
            pool.towers.push(towers[i].id)
        }
    }
}
_.assign(global, {structure_updater:structure_updater})