export const tower_run = function(room: Room){
        if(room.memory._typed._type != 'owned') return
        const towers = room.memory._typed._struct.towers;
        var tower:StructureTower|null = Game.getObjectById(towers[0]);
        if(!tower)return

        const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(!closestHostile)return
        
        for(let id in towers){
            tower = Game.getObjectById(towers[id]);
            if(tower)tower.attack(closestHostile);
        }
     
}