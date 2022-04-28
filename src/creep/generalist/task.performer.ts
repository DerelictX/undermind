
export const task_performers = {
    
    harvest(creep: Creep, params:HarvestTask):TaskReturnCode {
        let target = Game.getObjectById(params.target)
        if(!target){
            creep.say('ERR:' + ERR_NOT_FOUND)
            return 'error'
        }
        if(!creep.pos.isNearTo(target)){
            creep.moveTo(target)
            return 'doing'
        }

        if(creep.store.getFreeCapacity() == 0){
            return 'done_all'
        }
        const ret_val = creep.harvest(target)
        if(ret_val == OK || ret_val == ERR_TIRED){
            return 'doing'
        }
        else{
            creep.say('ERR:' + ret_val)
            return 'error'
        }
    },

    upgrade(creep:Creep, params:UpgradeTask):TaskReturnCode {
        let target = Game.getObjectById(params.target)
        if(!target){
            creep.say('ERR:' + ERR_NOT_FOUND)
            return 'error'
        }
        if(!creep.pos.inRangeTo(target,3)){
            creep.moveTo(target)
            return 'doing'
        }

        if(creep.store['energy'] == 0){
            return 'done_all'
        }
        const ret_val = creep.upgradeController(target)
        if(ret_val == OK){
            return 'doing'
        }
        else{
            creep.say('ERR:' + ret_val)
            return 'error'
        }
    },

    repair(creep:Creep, params:RepairTask):TaskReturnCode {
        let target = Game.getObjectById(params.target)
        if(!target){
            creep.say('ERR:' + ERR_NOT_FOUND)
            return 'error'
        }

        if(creep.store['energy'] == 0){
            return 'done_all'
        }
        if(target.hits >= target.hitsMax){
            return 'done_one'
        }
        
        if(!creep.pos.inRangeTo(target,3)){
            creep.moveTo(target)
            return 'doing'
        }
        const ret_val = creep.repair(target)
        if(ret_val == OK){
            return 'doing'
        }
        else{
            creep.say('ERR:' + ret_val)
            return 'error'
        }

    },

    build(creep:Creep, params:BuildTask):TaskReturnCode {
        let target = Game.getObjectById(params.target)
        if(!target){
            return 'done_one'
        }
        if(!creep.pos.inRangeTo(target,3)){
            creep.moveTo(target)
            return 'doing'
        }

        if(creep.store['energy'] == 0){
            return 'done_all'
        }
        const ret_val = creep.build(target)
        if(ret_val == OK){
            return 'doing'
        }
        else{
            creep.say('ERR:' + ret_val)
            return 'error'
        }

    },

    transfer(creep: Creep, params:TransferEnergyTask):TaskReturnCode {
        let target = Game.getObjectById(params.target)
        if(!target){
            creep.say('ERR:' + ERR_NOT_FOUND)
            return 'error'
        }

        if(creep.store['energy'] == 0){
            return 'done_all'
        }
        if(target.store.getFreeCapacity('energy') == 0){
            return 'done_one'
        }

        if(!creep.pos.isNearTo(target)){
            creep.moveTo(target)
            return 'doing'
        }
        const ret_val = creep.transfer(target,'energy')
        if(ret_val == OK){
            return 'done_one'
        }
        else{
            creep.say('ERR:' + ret_val)
            return 'error'
        }

    },

    withdraw(creep: Creep, params:WithdrawEnergyTask):TaskReturnCode {
        let target = Game.getObjectById(params.target)
        if(!target){
            creep.say('ERR:' + ERR_NOT_FOUND)
            return 'error'
        }

        if(creep.store.getFreeCapacity() == 0){
            return 'done_all'
        }
        if(target.store['energy'] == 0){
            return 'done_one'
        }
        
        if(!creep.pos.isNearTo(target)){
            creep.moveTo(target)
            return 'doing'
        }
        const ret_val = creep.withdraw(target,'energy')
        if(ret_val == OK){
            return 'done_one'
        }
        else{
            creep.say('ERR:' + ret_val)
            return 'error'
        }

    }

}
