type PrimitivePerformer<T extends PrimitiveAction>
    = (creep: Creep, args?:CachedArgs<Parameters<Creep[T]>>) => ScreepsReturnCode

const performer:{[action in PrimitiveAction]:PrimitivePerformer<action>} = {
    harvest: function (creep: Creep, args?: [target: Id<Source | Mineral<MineralConstant> | Deposit>]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.harvest(target);
    },
    dismantle: function (creep: Creep, args?: [target: Id<Structure<StructureConstant>>]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.dismantle(target);
    },
    build: function (creep: Creep, args?: [target: Id<ConstructionSite<BuildableStructureConstant>>]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.build(target);
    },
    repair: function (creep: Creep, args?: [target: Id<Structure<StructureConstant>>]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.repair(target);
    },
    upgradeController: function (creep: Creep, args?: [target: Id<StructureController>]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.upgradeController(target);
    },
    generateSafeMode: function (creep: Creep, args?: [target: Id<StructureController>]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.generateSafeMode(target);
    },
    withdraw: function (creep: Creep, args?: [
            target: Id<Structure<StructureConstant> | Tombstone | Ruin>,
            resourceType: ResourceConstant, amount?: number | undefined]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND

        let ret = creep.withdraw(target,args[1],args[2]);
        if(ret == ERR_FULL || ret == ERR_NOT_ENOUGH_RESOURCES)
            ret = creep.withdraw(target,args[1]);
        return ret
    },
    transfer: function (creep: Creep, args?: [
            target: Id<Structure<StructureConstant> | AnyCreep>,
            resourceType: ResourceConstant, amount?: number | undefined]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        
        let ret = creep.transfer(target,args[1],args[2]);
        if(ret == ERR_FULL || ret == ERR_NOT_ENOUGH_RESOURCES)
            ret = creep.transfer(target,args[1]);
        return ret
    },
    pickup: function (creep: Creep, args?: [target: Id<Resource<ResourceConstant>>]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.pickup(target);
    },
    drop: function (creep: Creep, args?: [
            resourceType: ResourceConstant, amount?: number | undefined]) {
        if(!args) return ERR_INVALID_ARGS
        return creep.drop(args[0],args[1]);
    },
    attackController: function (creep: Creep, args?: [target: Id<StructureController>]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.attackController(target);
    },
    reserveController: function (creep: Creep, args?: [target: Id<StructureController>]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.reserveController(target);
    },
    claimController: function (creep: Creep, args?: [target: Id<StructureController>]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.claimController(target);
    },
    attack: function (creep: Creep, args?: [target: Id<Structure<StructureConstant> | AnyCreep>]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.attack(target);
    },
    rangedAttack: function (creep: Creep, args?: [target: Id<Structure<StructureConstant> | AnyCreep>]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.rangedAttack(target);
    },
    rangedMassAttack: function (creep: Creep, args?: []) {
        return creep.rangedMassAttack();
    },
    heal: function (creep: Creep, args?: [target: Id<AnyCreep>]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.heal(target);
    },
    rangedHeal: function (creep: Creep, args?: [target: Id<AnyCreep>]) {
        if(!args) return ERR_INVALID_ARGS
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.rangedHeal(target);
    }
}

export const perform_primitive = function(creep:Creep, behavior:ActionDescript<PrimitiveAction>): ScreepsReturnCode {
    const action = behavior.action
    let ret: ScreepsReturnCode
    switch(action){
        //WORK
        case 'harvest':             ret = performer[action](creep,behavior.args); break;
        case 'dismantle':
        //WORK & CARRY
        case 'repair':              ret = performer[action](creep,behavior.args); break;
        case 'build':               ret = performer[action](creep,behavior.args); break;
        case 'upgradeController':
        //CLAIM
        case 'claimController':
        case 'attackController':
        case 'reserveController':
        //CARRY
        case 'generateSafeMode':    ret = performer[action](creep,behavior.args); break;
        case "withdraw":            ret = performer[action](creep,behavior.args); break;
        case 'transfer':            ret = performer[action](creep,behavior.args); break;
        case 'pickup':              ret = performer[action](creep,behavior.args); break;
        case 'drop':                ret = performer[action](creep,behavior.args); break;
        //ATTACK
        case 'attack':
        case 'rangedAttack':        ret = performer[action](creep,behavior.args); break;
        case 'heal':
        case 'rangedHeal':          ret = performer[action](creep,behavior.args); break;
        case 'rangedMassAttack':    ret = performer[action](creep,behavior.args); break;
    }
    return ret
}

export const goPerform = function(creep:Creep, behavior:ActionDescript<TargetedAction>): ScreepsReturnCode {
    let ret = perform_primitive(creep,behavior)
    if(ret == ERR_NOT_IN_RANGE){
        const target = Game.getObjectById(behavior.args[0])
        if(target) ret = creep.moveTo(target)
    }
    return ret
}