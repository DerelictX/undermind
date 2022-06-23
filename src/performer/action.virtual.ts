type VirtualPerformer<T extends keyof VirtualAction>
    = (creep: Creep|PowerCreep, args:VirtualAction[T]) => ScreepsReturnCode

const performer:{[action in keyof VirtualAction]: VirtualPerformer<action>} = {
    approach: function (creep: Creep | PowerCreep, args: VirtualAction['approach']) {
        const pos = new RoomPosition(args[0].x, args[0].y, args[0].roomName)
        return creep.pos.inRangeTo(pos, args[1]) ? OK : creep.moveTo(pos) //custom_move.moveTo(creep,pos)
    },

    escape: function (creep: Creep | PowerCreep, args: VirtualAction['escape']) {
        throw new Error("Function not implemented.")
    },

    prejudge_full: function (creep: Creep | PowerCreep, args: VirtualAction['prejudge_full']) {
        return creep.store.getFreeCapacity() > args[0] ? OK : ERR_FULL
    },

    prejudge_empty: function (creep: Creep | PowerCreep, args: VirtualAction['prejudge_empty']) {
        return creep.store.getUsedCapacity() > args[0] ? OK : ERR_NOT_ENOUGH_RESOURCES
    },
}

export const perform_virtual = function(creep:Creep, behavior:ActionDescript<keyof VirtualAction>): ScreepsReturnCode {
    const action = behavior.action
    let ret: ScreepsReturnCode
    switch(action){
        case 'approach':
        case 'escape':          ret = performer[action](creep,behavior.args); break;
        case 'prejudge_full':
        case 'prejudge_empty':  ret = performer[action](creep,behavior.args); break;
    }
    return ret
}