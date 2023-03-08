export const perform_primitive = function
    <T extends PrimitiveAction>
    (creep:Creep, action:T, args:CachedArgs<Parameters<Creep[T]>>): ScreepsReturnCode
    {return performer[action](creep,args)}

const performer:{
    [action in PrimitiveAction]:
    (creep: Creep, args:CachedArgs<Parameters<Creep[action]>>) => ScreepsReturnCode
} = {
    harvest: function (creep: Creep, args: [target: Id<Source | Mineral<MineralConstant> | Deposit>]) {
        const target = Game.getObjectById(args[0])
        if(!creep.store.getFreeCapacity() && creep.store.getCapacity())
            return ERR_FULL
        if(!target) return ERR_NOT_FOUND
        return creep.harvest(target);
    },
    dismantle: function (creep: Creep, args: [target: Id<Structure<StructureConstant>>]) {
        const target = Game.getObjectById(args[0])
        if(!creep.store.getFreeCapacity() && creep.store.getCapacity())
            return ERR_FULL
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
        if(target.hits == target.hitsMax) return ERR_FULL
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

        if(creep.store['G'] < 1000) return ERR_NOT_ENOUGH_RESOURCES
        return creep.generateSafeMode(target);
    },
    withdraw: function (creep: Creep, args: [
            target: Id<AnyStoreStructure | Tombstone | Ruin>,
            resourceType: ResourceConstant, amount?: number | undefined]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND

        if(!creep.store.getFreeCapacity(args[1]))
            return ERR_FULL
        if(!target.store.getUsedCapacity(args[1]))
            return ERR_NOT_ENOUGH_RESOURCES

        let ret = creep.withdraw(target,args[1],args[2]);
        if(ret == ERR_FULL || ret == ERR_NOT_ENOUGH_RESOURCES)
            ret = creep.withdraw(target,args[1]);
        return ret
    },
    transfer: function (creep: Creep, args: [
            target: Id<AnyStoreStructure | AnyCreep>,
            resourceType: ResourceConstant, amount?: number | undefined]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        
        if(!creep.store.getUsedCapacity(args[1]))
            return ERR_NOT_ENOUGH_RESOURCES
        if(!target.store.getFreeCapacity(args[1]))
            return ERR_FULL

        let ret = creep.transfer(target,args[1],args[2]);
        if(ret == ERR_FULL || ret == ERR_NOT_ENOUGH_RESOURCES)
            ret = creep.transfer(target,args[1]);
        return ret
    },
    pickup: function (creep: Creep, args: [target: Id<Resource<ResourceConstant>>]) {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND

        if(creep.store.getFreeCapacity() == 0) return ERR_FULL
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
        if(target.my) return OK
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