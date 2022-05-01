
export const death_detect = function(){
    //enqueue
    for(let creep_name in Memory.creeps) {
        if(!Game.creeps[creep_name]) {
            try{
                delete Memory.creeps[creep_name];
                //console.log('Clearing non-existing creep memory:', name);
            }catch(error){
                delete Memory.creeps[creep_name];
                console.log(creep_name + ':' + error);
            }
        }
    }
}