/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('tower');
 * mod.thing == 'a thing'; // true
 */


export const tower_run = function(room: Room){
    
        if(!room.memory.structures)return
        const towers = room.memory.structures.towers;
        var tower:StructureTower|null = Game.getObjectById(towers[0]);
        if(!tower)return

        /*
        if(tower.store['energy']<=600 && room.memory.tasks.transport.towers.length==0){
            room.memory.tasks.scan.push('supply_towers')
        }
        */

        const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(!closestHostile)return
        
        for(let id in towers){
            tower = Game.getObjectById(towers[id]);
            if(tower)tower.attack(closestHostile);
        }
     
}