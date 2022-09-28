type EnWorkerPriority = [from: EnSource[], to: EnSink[]]

export const work_priority: {[role in EnergyRole]:EnWorkerPriority} = {
    Upgrader: [['W_ctrl'], ['U_ctrl']],
    Builder: [
        ['W_energy', 'H_srcs'],
        ['repair', 'anti_nuke', 'build', 'fortify', 'U_ctrl']
    ],
    Maintainer: [
        ['W_energy', 'H_srcs'],
        ['repair', 'downgraded', 'decayed', 'fortify', 'U_ctrl', 'build']
    ],
    EnergySupplier: [
        ['W_energy'],
        ['T_ext', 'T_tower', 'T_cntn']
    ],
    RMaintainer: [
        ['W_energy', 'H_srcs'],
        ['decayed', 'build']
    ]
}

export const carry_priority: {[role in CarrierRole]:ResFlow[]} = {
    Collector: [
        ['W_link', 'storage'], ['sweep', 'storage'], ['W_cntn', 'storage'],
        ['loot', 'storage'], ['storage', 'T_ext'],
        ['W_term', 'storage'], ['compound','storage'], ['W_fact', 'storage']],
    Supplier: [
        ['W_link', 'storage'], ['storage', 'T_ext'], ['W_energy', 'T_tower'],
        ['storage', 'T_term'], ['storage', 'T_fact'], ['storage', 'T_power'],
        ['storage','T_react'], ['storage', 'T_nuker']],
    Chemist: [
        ['storage','T_boost'], ['storage','T_react'], ['compound','storage'],
        ['W_term','storage'], ['storage','T_term'],
        ['storage','T_fact'], ['W_fact','storage']]
}

export const init_carrier_behavior = function(role:CarrierRole,
        fromRoom:string,toRoom:string): CarrierMemory {
    return {
        bhvr_name:  "carrier",
        state:      "idle",
        collect:    [],
        consume:    [],
        current:    carry_priority[role][0],
        fromRoom:   fromRoom,
        toRoom:     toRoom,
        priority:   role
    }
}

export const init_worker_behavior = function(role:EnergyRole,
            fromRoom:string,toRoom:string): WorkerMemory {
    return {
        bhvr_name:  "worker",
        state:      "collect",
        collect:    [],
        consume:    [],
        fromRoom:   fromRoom,
        toRoom:     toRoom,
        priority:   role
    }
}