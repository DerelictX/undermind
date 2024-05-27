export const run_fighter = function (creep: Creep, fb: FighterMemory) {
    const _squad = Memory.squads[fb.squad_id]
    if (!_squad) return
    if (_squad.pending) {
        if (_squad.member.length == fb.slot) {
            _squad.member.push(creep.name)
        }
        return;
    }
    //creep.rangedMassAttack()
}