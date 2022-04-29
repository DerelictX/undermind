type ActionPerformer<T extends PrimitiveAction>
    = (creep:Creep, args:CachedArgs<Parameters<Creep[T]>>) => ScreepsReturnCode

const performer:{[action in PrimitiveAction]:ActionPerformer<action>} = {

    harvest: function (creep: Creep, args: [target: Id<Source | Mineral<MineralConstant> | Deposit>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.harvest(target);
    },
    dismantle: function (creep: Creep, args: [target: Id<Structure<StructureConstant>>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.dismantle(target);
    },
    build: function (creep: Creep, args: [target: Id<ConstructionSite<BuildableStructureConstant>>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.build(target);
    },
    repair: function (creep: Creep, args: [target: Id<Structure<StructureConstant>>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.repair(target);
    },
    upgradeController: function (creep: Creep, args: [target: Id<StructureController>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.upgradeController(target);
    },
    generateSafeMode: function (creep: Creep, args: [target: Id<StructureController>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.generateSafeMode(target);
    },
    withdraw: function (creep: Creep, args: [
            target: Id<Structure<StructureConstant> | Tombstone | Ruin>,
            resourceType: ResourceConstant, amount?: number | undefined]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.withdraw(target,args[1],args[2]);
    },
    transfer: function (creep: Creep, args: [
            target: Id<Structure<StructureConstant> | AnyCreep>,
            resourceType: ResourceConstant, amount?: number | undefined]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.transfer(target,args[1],args[2]);
    },
    pickup: function (creep: Creep, args: [target: Id<Resource<ResourceConstant>>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.pickup(target);
    },
    drop: function (creep: Creep, args: [
            resourceType: ResourceConstant, amount?: number | undefined]) {
        return creep.drop(args[0],args[1]);
    },
    attackController: function (creep: Creep, args: [target: Id<StructureController>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.attackController(target);
    },
    reserveController: function (creep: Creep, args: [target: Id<StructureController>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.reserveController(target);
    },
    claimController: function (creep: Creep, args: [target: Id<StructureController>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.claimController(target);
    },
    attack: function (creep: Creep, args: [target: Id<Structure<StructureConstant> | AnyCreep>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.attack(target);
    },
    rangedAttack: function (creep: Creep, args: [target: Id<Structure<StructureConstant> | AnyCreep>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.rangedAttack(target);
    },
    rangedMassAttack: function (creep: Creep, args: []) {
        return creep.rangedMassAttack();
    },
    heal: function (creep: Creep, args: [target: Id<AnyCreep>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.heal(target);
    },
    rangedHeal: function (creep: Creep, args: [target: Id<AnyCreep>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return creep.rangedHeal(target);
    }
}

const perform_primitive = function(creep:Creep, behavior:ActionDescript<PrimitiveAction>): ScreepsReturnCode {
    switch(behavior.bhvr_name){
        //WORK
        case 'harvest':
            return performer[behavior.bhvr_name](creep,behavior.args)
        case 'dismantle':
        //WORK & CARRY
        case 'repair':
            return performer[behavior.bhvr_name](creep,behavior.args)
        case 'build':
            return performer[behavior.bhvr_name](creep,behavior.args)
        case 'upgradeController':
        //CLAIM
        case 'claimController':
        case 'attackController':
        case 'reserveController':
        //CARRY
        case 'generateSafeMode':
            return performer[behavior.bhvr_name](creep,behavior.args)
        case "withdraw":
            return performer[behavior.bhvr_name](creep,behavior.args)
        case 'transfer':
            return performer[behavior.bhvr_name](creep,behavior.args)
        case 'pickup':
            return performer[behavior.bhvr_name](creep,behavior.args)
        case 'drop':
            return performer[behavior.bhvr_name](creep,behavior.args)
        //ATTACK
        case 'attack':
        case 'rangedAttack':
            return performer[behavior.bhvr_name](creep,behavior.args)
        case 'heal':
        case 'rangedHeal':
            return performer[behavior.bhvr_name](creep,behavior.args)
        case 'rangedMassAttack':
            return performer[behavior.bhvr_name](creep,behavior.args)
    }
    
}
