
type VirtualPerformer<T extends keyof VirtualAction>
    = (creep: Creep, args:VirtualAction[T]) => ScreepsReturnCode

const performer:{[action in keyof VirtualAction]:VirtualPerformer<action>} = {
    prejudge_full: function(creep:Creep, args:VirtualAction['prejudge_full']){
        return creep.store.getFreeCapacity() > args[0] ? OK : ERR_FULL
    },
    
    prejudge_empty: function(creep:Creep, args:VirtualAction['prejudge_empty']){
        return creep.store.getUsedCapacity() > args[0] ? OK : ERR_NOT_ENOUGH_RESOURCES
    },
    
    approach: function(creep:Creep, args:VirtualAction['approach']){
        const pos = new RoomPosition(args[0].x,args[0].y,args[0].roomName)
        return creep.pos.inRangeTo(pos,args[1]) ? OK : creep.moveTo(pos)
    }
}

type VirtualAction = {
    prejudge_full:  [amount:number],

    prejudge_empty: [amount:number],
    
    approach:   [pos:RoomPosition, range:number]
}