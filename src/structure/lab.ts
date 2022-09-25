import { compound_tier, reactions } from "@/constant/resource_series";
import _ from "lodash";

export const lab_run = function(room: Room){
    if(room.memory._typed._type != 'owned') return
    const labs = room.memory._typed._struct.labs
    const reaction = labs.reaction
    if(!reaction) return
    const labs_in0 = Game.getObjectById(labs.ins[0]);
    const labs_in1 = Game.getObjectById(labs.ins[1]);
    if(!labs_in0 || !labs_in1)return

    const opts: TextStyle = {
        font:0.5,color:'#FF7F7F',
        stroke:'#7F7F00',
        strokeWidth:0.1
    }
    room.visual.text(reactions[reaction][0],labs_in0.pos,opts)
    room.visual.text(reactions[reaction][1],labs_in1.pos,opts)
    if(labs_in0.mineralType != reactions[reaction][0]
            || labs_in1.mineralType != reactions[reaction][1])
        return

    const labs_out = labs.outs;
    for(var id in labs_out){
        let lab = Game.getObjectById(labs_out[id]);
        if(!lab || labs.boosts[id])
            continue;
        let ret = lab.runReaction(labs_in0, labs_in1);
        if(ret != OK)
            break;
    }
}

export const change_reaction = function(room:Room): MineralCompoundConstant|null {
    if(room.memory._typed._type != 'owned') return null
    const storage = room.storage
    const terminal = room.terminal
    if(!storage?.my || !terminal?.my) return null

    if(terminal.store['X'] < 1000){
        const demand = Memory.terminal.demand['X']
            ?? (Memory.terminal.demand['X'] = {})
        demand[room.name] = 1000
    }

    const labs = room.memory._typed._struct.labs
    const reaction = labs.reaction
    if(reaction){
        const labs_in0 = Game.getObjectById(labs.ins[0]);
        const labs_in1 = Game.getObjectById(labs.ins[1]);
        if(!labs_in0 || !labs_in1) return null
        if(labs_in0.store[reactions[reaction][0]] > 200
                && labs_in1.store[reactions[reaction][1]] > 200)
            return reaction
    }

    let reacts: MineralCompoundConstant[]
    reacts = compound_tier[0]
    for(let i in reacts){
        if(storage.store[reacts[i]] > 24000)
            continue
        const reactants = reactions[reacts[i]] 
        if(terminal.store[reactants[0]] >= 1000 && terminal.store[reactants[1]] >= 1000){
            return labs.reaction = reacts[i]
        }
    }

    reacts = compound_tier[3]
    for(let i in reacts){
        const reactants = reactions[reacts[i]] 
        if(terminal.store[reactants[0]] >= 500 && terminal.store[reactants[1]] >= 500){
            return labs.reaction = reacts[i]
        }
    }
    return labs.reaction = null
}
_.assign(global, {change_reaction:change_reaction})

export const T_react = function (room: Room): PosedCreepTask<"transfer">[] {
    if(room.memory._typed._type != 'owned') return[]
    const terminal = room.terminal
    const labs = room.memory._typed._struct.labs
    const compoundType = labs.reaction
    if (!terminal || !compoundType) return []

    var tasks: PosedCreepTask<'transfer'>[] = []
    for (let i in labs.ins) {
        const reactantType = reactions[compoundType][i]
        const lab_in = Game.getObjectById(labs.ins[i])
        if (!lab_in) continue

        //reactant
        if (lab_in.store.getFreeCapacity(reactantType) > 2400) {
            if(!terminal.store[reactantType]){
                return []
            }
            tasks.push({
                action: 'transfer',
                args: [lab_in.id, reactantType, 400],
                pos: lab_in.pos
            })
        }
    }
    return tasks
}
export const T_boost = function (room: Room): PosedCreepTask<"transfer">[] {
    if(room.memory._typed._type != 'owned') return[]
    const labs = room.memory._typed._struct.labs
    var tasks: PosedCreepTask<'transfer'>[] = []
    for (let i in labs.outs) {
        const boostType: MineralBoostConstant | undefined = labs.boosts[i]
        const lab_out = Game.getObjectById(labs.outs[i])
        if (!lab_out)
            continue

        if (boostType && lab_out.store.getFreeCapacity(boostType) >= 1800) {
            tasks.push({
                action: 'transfer',
                args: [lab_out.id, boostType, 1200],
                pos: lab_out.pos
            })
        }
        if (lab_out.store['energy'] <= 1200) {
            tasks.push({
                action: 'transfer',
                args: [lab_out.id, 'energy', 800],
                pos: lab_out.pos
            })
        }
    }
    return tasks
}

/**
 * 收集反应产物
 * @param room
 * @returns
 */
export const compound = function (room: Room) {
    if(room.memory._typed._type != 'owned') return[]
    var tasks: PosedCreepTask<"withdraw">[] = []
    const labs = room.memory._typed._struct.labs
    const compoundType = labs.reaction

    for (let i in labs.ins) {
        const reactantType = compoundType ? reactions[compoundType][i] : null
        const lab_in = Game.getObjectById(labs.ins[i])
        if (!lab_in)
            continue
        /**反应底物不对，取出来 */
        if (lab_in.mineralType && reactantType != lab_in.mineralType) {
            tasks.push({
                action: 'withdraw',
                args: [lab_in.id, lab_in.mineralType],
                pos: lab_in.pos
            })
        }
    }

    for (let i in labs.outs) {
        const boostType: MineralBoostConstant | undefined = labs.boosts[i]
        const lab_out = Game.getObjectById(labs.outs[i])
        if (!lab_out)
            continue

        if (boostType) {
            if (lab_out.mineralType && boostType != lab_out.mineralType) {
                tasks.push({
                    action: 'withdraw',
                    args: [lab_out.id, lab_out.mineralType, lab_out.store[lab_out.mineralType]],
                    pos: lab_out.pos
                })
            }
        } else {
            if (lab_out.mineralType && (compoundType != lab_out.mineralType
                    || lab_out.store[compoundType] >= (tasks.length ? 200 : 300))) {
                tasks.push({
                    action: 'withdraw',
                    args: [lab_out.id, lab_out.mineralType, lab_out.store[lab_out.mineralType]],
                    pos: lab_out.pos
                })
            }
        }
    }
    return tasks
}