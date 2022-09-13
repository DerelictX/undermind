export const holdPlace = function(creep:Creep|PowerCreep){
    if(!creep.room) return
    const pos = creep.pos
    let pos_str = ''
    pos_str += pos.x > 9 ? pos.x : '0' + pos.x
    pos_str += pos.y > 9 ? pos.y : '0' + pos.y
    if(!Memory._pos_hold[creep.room.name])
        Memory._pos_hold[creep.room.name] = {}
    const _pos_hold = Memory._pos_hold[creep.room.name]
    if(_pos_hold) _pos_hold[pos_str] = creep.id
}