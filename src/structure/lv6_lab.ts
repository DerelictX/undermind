import {companion_base, compound_tier, reactions, reaction_line} from "@/constant/resource_series";
import _ from "lodash";
import {demand_res} from "./lv6_terminal";
import {approach} from "@/move/action.virtual";

export const lab_run = function (room: Room) {
    const room_config = room.memory.labs
    if (!room_config) return

    let id: Id<StructureLab>;
    for (id in room_config.labs) {
        const config = room_config.labs[id]
        const lab0 = Game.getObjectById(id)
        if (!lab0 || config.react_type == 'base')
            continue;
        const lab1 = Game.getObjectById(config.lab1)
        const lab2 = Game.getObjectById(config.lab2)
        if (!lab1 || !lab2) continue;
        switch (config.react_type) {
            case 'run':
                if (room_config.target_res[config.lab1] == lab1.mineralType &&
                    room_config.target_res[config.lab2] == lab2.mineralType) {
                    lab0.runReaction(lab1, lab2);
                }
                break;
            case 'reverse':
                if (room_config.target_res[id] == lab1.mineralType)
                    lab0.reverseReaction(lab1, lab2);
                break;
        }
    }
}

export const change_reaction = function (room: Room): MineralCompoundConstant | null {
    const storage = room.storage
    const terminal = room.terminal
    const room_config = room.memory.labs
    if (!storage?.my || !terminal?.my || !room_config) return null

    const list: ResourceConstant[] = ['X', 'OH', 'O', 'H']
    for (let resourceType of list)
        if (terminal.store[resourceType] < 1000)
            demand_res(terminal, resourceType, 1000)

    /**Base */
    let reactant0: keyof typeof companion_base
    for (reactant0 in companion_base) {
        const reactant1 = companion_base[reactant0][0]
        const target = companion_base[reactant0][1]
        if (storage.store[target] > 20000)
            continue
        if (terminal.store[reactant0] < 1000)
            continue
        if (terminal.store[reactant1] >= 1000) {
            return target
        } else {
            demand_res(terminal, reactant1, 1000)
        }
    }

    /**T3, T2 */
    let reacts: MineralCompoundConstant[] = compound_tier[3]
    reacts = reacts.concat(compound_tier[2])
    for (let target of reacts) {
        const reactants = reactions[target]
        if (terminal.store[reactants[0]] >= 1000 && terminal.store[reactants[1]] >= 1000) {
            return target
        }
    }

    /**T1 */
    for (let tier1 of compound_tier[1]) {
        const stock = storage.store[reaction_line[tier1][0]]
            + storage.store[reaction_line[tier1][1]]
            + storage.store[reaction_line[tier1][2]]
        //0.05 * 10 = 0.5
        if (stock > storage.store.getCapacity() * 0.05)
            continue
        const reactants = reactions[tier1]
        if (storage.store[reactants[0]] >= 1000 && terminal.store[reactants[1]] >= 1000) {
            return tier1
        }
    }
    return null
}
_.assign(global, {change_reaction: change_reaction})

export const T_react = function (room: Room): PosedCreepTask<"transfer">[] {
    const terminal = room.terminal
    const room_config = room.memory.labs
    if (!terminal || !room_config) return []
    const tasks: PosedCreepTask<'transfer'>[] = [];

    let id: Id<StructureLab>;
    for (id in room_config.labs) {
        if (room_config.boost_type[id]) continue
        const targetRes = room_config.target_res[id]
        const lab = Game.getObjectById(id)
        if (!lab || !targetRes) continue
        //reactant
        if (lab.store.getFreeCapacity(targetRes) > 2400) {
            if (!terminal.store[targetRes]) return []
            tasks.push({
                action: 'transfer',
                args: [lab.id, targetRes, 400],
                pos: lab.pos
            })
        }
    }
    return tasks
}

export const T_boost = function (room: Room): PosedCreepTask<"transfer">[] {
    const labs = room.memory.labs
    if (!labs) return []
    const tasks: PosedCreepTask<'transfer'>[] = [];
    let id: Id<StructureLab>
    for (id in labs.boost_type) {
        const boostType = labs.boost_type[id]
        const totalAmount = boostType ? labs.boost_amount[boostType] : undefined
        const lab_out = Game.getObjectById(id)
        if (!boostType || !totalAmount || !lab_out) continue

        const free = lab_out.store.getFreeCapacity(boostType)
        const amount = free > 0 ? Math.min(totalAmount - lab_out.store[boostType], free) : 0
        if (amount > 0) {
            tasks.push({
                action: 'transfer',
                args: [lab_out.id, boostType, amount],
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
    const room_config = room.memory.labs
    if (!room_config) return []
    const tasks: PosedCreepTask<"withdraw">[] = [];

    let id: Id<StructureLab>;
    for (id in room_config.labs) {
        const lab = Game.getObjectById(id)
        if (!lab?.mineralType) continue

        const boostType = room_config.boost_type[id]
        if (boostType) {
            if (boostType != lab.mineralType) {
                tasks.push({
                    action: 'withdraw',
                    args: [lab.id, lab.mineralType, lab.store[lab.mineralType]],
                    pos: lab.pos
                })
            }
        } else {
            const config = room_config.labs[id]
            const targetRes = room_config.target_res[id]
            if (targetRes != lab.mineralType || config.react_type == 'run'
                && lab.store[targetRes] >= (tasks.length ? 200 : 300)) {
                tasks.push({
                    action: 'withdraw',
                    args: [lab.id, lab.mineralType, lab.store[lab.mineralType]],
                    pos: lab.pos
                })
            }
        }
    }
    return tasks
}

export const publish_boost_task = function (creep_name: string, room_name: string,
                                            boost: Partial<Record<BodyPartConstant, MineralBoostConstant>>) {
    const creep = Game.creeps[creep_name]
    const labs = Memory.rooms[room_name].labs
    if (!creep || !labs) return

    console.log("publish_boost_task:\t" + creep_name)
    let body: BodyPartConstant
    for (body in boost) {
        const amount = creep.getActiveBodyparts(body) * 30
        const boostType = boost[body]
        if (amount && boostType) {
            labs.boost_amount[boostType] = (labs.boost_amount[boostType] ?? 0) + amount
        }
    }
    check_boost_labs(labs)
}

export function run_for_boost(creep: Creep) {
    const boost = creep.memory._life.boost
    const boost_room = creep.memory._life.boost_room
    if (!boost || !boost_room) return
    const labs = Memory.rooms[boost_room].labs
    if (!labs) return

    let body: BodyPartConstant
    for (body in boost) {
        const boostType = boost[body]
        if (!boostType) return
        const lab_id = labs.boost_lab[boostType]
        const lab = lab_id ? Game.getObjectById(lab_id) : null
        if (!lab) return

        if (creep.pos.isNearTo(lab)) {
            const ret = lab.boostCreep(creep, creep.getActiveBodyparts(body))
            const amount = creep.getActiveBodyparts(body) * 30
            if (ret == OK) {
                delete boost[body]
                labs.boost_amount[boostType] = (labs.boost_amount[boostType] ?? 0) - amount
                if ((labs.boost_amount[boostType] ?? 0) < 0) {
                    labs.boost_amount[boostType] = 0
                }
                check_boost_labs(labs)
            }
        } else {
            approach(creep, lab.pos, 1)
        }
        return
    }
    delete creep.memory._life.boost
}

function check_boost_labs(room_config: LabConfig) {
    let missing_lab: MineralBoostConstant[] = []
    let res: MineralBoostConstant
    for (res in room_config.boost_amount) {
        if ((room_config.boost_amount[res] ?? 0) <= 0) {
            delete room_config.boost_lab[res]
        } else if (!room_config.boost_lab[res]) {
            missing_lab.push(res)
        }
    }

    let id: Id<StructureLab>;
    for (id in room_config.labs) {
        const config = room_config.labs[id]
        let res = room_config.boost_type[id]
        if (res) {
            if (room_config.boost_lab[res] == id)
                continue
            else
                delete room_config.boost_type[id]
        }
        res = missing_lab.pop()
        if (res) {
            room_config.boost_type[id] = res
            room_config.boost_lab[res] = id
        }
    }
}