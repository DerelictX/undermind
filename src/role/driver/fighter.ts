export const run_fighter = function (creep: Creep, fb: FighterMemory) {
    const _squad = Memory.squads[fb.squad_id]
    if (!_squad) return
    if (_squad.pending) {
        if (_squad.member.length == fb.slot) {
            _squad.member.push(creep.name)
        }
        return;
    }

    if (creep.getActiveBodyparts(ATTACK) || creep.getActiveBodyparts(RANGED_ATTACK)) {
        let hostile: AnyCreep | AnyOwnedStructure | null = null
        if (_squad.enemy) hostile = Game.getObjectById(_squad.enemy)
        if (!hostile) hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        if (!hostile) hostile = creep.pos.findClosestByRange(FIND_HOSTILE_POWER_CREEPS)
        if (!hostile) hostile = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => structure.hits > 0
        })
        if (hostile && creep.pos.inRangeTo(hostile, 3)) {
            if (creep.pos.isNearTo(hostile)) {
                creep.rangedMassAttack();
                creep.attack(hostile)
            } else {
                creep.rangedAttack(hostile)
            }
        } else {
            creep.rangedMassAttack();
        }
    }

    if (creep.getActiveBodyparts(HEAL)) {
        const squad_length = _squad.member.length;
        for (let i = 0; i < squad_length; ++i) {
            const injured = Game.creeps[_squad.member[i]]
            if (!injured) continue
            if (injured.hits < injured.hitsMax) {
                if (creep.pos.isNearTo(injured)) {
                    creep.heal(injured)
                } else {
                    creep.rangedHeal(injured)
                }
                break
            }
        }
    }
}