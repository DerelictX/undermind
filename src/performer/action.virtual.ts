import { adjace_dir, base64table } from "@/move/Kuhn-Munkres"
import { hikeTo } from "@/move/route"

type VirtualPerformer<T extends keyof VirtualAction>
    = (creep: Creep|PowerCreep, args:VirtualAction[T]) => ScreepsReturnCode

const performer:{[action in keyof VirtualAction]: VirtualPerformer<action>} = {
    approach: function (creep: AnyCreep, args: VirtualAction['approach']) {
        if(!creep.room) return ERR_NOT_FOUND
        const roomName = creep.room.name
        const pos = new RoomPosition(args[0].x, args[0].y, args[0].roomName)

        if (creep.pos.inRangeTo(pos, args[1])) {
            if(args[1] <= 0 || creep.pos.inRangeTo(pos, args[1]-1)) {
                return OK
            }
            let dir = creep.pos.getDirectionTo(pos)
            const _move_intents = Memory._move_intents[roomName] ?? (Memory._move_intents[roomName] = {})
            const pos_str = base64table[creep.pos.x] + base64table[creep.pos.y]
            _move_intents[pos_str] = {id: creep.id, step: adjace_dir[dir]}
            return OK
        }
        if(creep instanceof Creep && creep.fatigue){
            this.hold_place(creep,[0])
            return ERR_TIRED
        }
        let ret = hikeTo(creep,pos)
        if (ret == ERR_TIRED)
            return OK
        return ret
    },

    escape: function (creep: AnyCreep, args: VirtualAction['escape']) {
        throw new Error("Function not implemented.")
    },
    
    hold_place: function (creep: AnyCreep, args: [priority: number]): ScreepsReturnCode {
        /**设置intent */
        if(!creep.room) return ERR_NOT_FOUND
        const roomName = creep.room.name
        const _move_intents = Memory._move_intents[roomName] ?? (Memory._move_intents[roomName] = {})
        const pos_str = base64table[creep.pos.x] + base64table[creep.pos.y]
        _move_intents[pos_str] = {id: creep.id, step: [0]}
        return OK
    },

    prejudge_full: function (creep: AnyCreep, args: VirtualAction['prejudge_full']) {
        return creep.store.getFreeCapacity() > args[0] ? OK : ERR_FULL
    },

    prejudge_empty: function (creep: AnyCreep, args: VirtualAction['prejudge_empty']) {
        return creep.store.getUsedCapacity() > args[0] ? OK : ERR_NOT_ENOUGH_RESOURCES
    },

    full_hits: function (creep: AnyCreep, args: [target: Id<Structure>, amount: number]): ScreepsReturnCode {
        const target = Game.getObjectById(args[0])
        if(!target) return ERR_NOT_FOUND
        return target.hits < target.hitsMax ? OK : ERR_FULL
    }
}

export const perform_virtual = function(creep:AnyCreep, behavior:VirtualDescript<keyof VirtualAction>): ScreepsReturnCode {
    const action = behavior.action
    let ret: ScreepsReturnCode
    switch(action){
        case 'approach':
        case 'escape':          ret = performer[action](creep,behavior.args); break;
        case 'hold_place':      ret = performer[action](creep,behavior.args); break;
        case 'prejudge_full':
        case 'prejudge_empty':  ret = performer[action](creep,behavior.args); break;
        case 'full_hits':       ret = performer[action](creep,behavior.args); break;
    }
    return ret
}