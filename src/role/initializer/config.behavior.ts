type EnSource = FilterCollectKey<WorkAction|CarryAction,'energy'>
type EnSink =   FilterConsumeKey<WorkAction|CarryAction,'energy'>
type EnWorkerPriority = [from: EnSource[], to: EnSink[]]

export const work_priority: {[role in EnergyRole]:EnWorkerPriority} = {
    Builder: [
        ['W_energy', 'H_srcs'],
        ['repair', 'anti_nuke', 'build', 'fortify', 'U_ctrl']
    ],
    Maintainer: [
        ['W_energy', 'H_srcs'],
        ['repair', 'downgraded', 'decayed', 'fortify', 'U_ctrl']
    ],
    EnergySupplier: [
        ['W_energy'],
        ['T_ext', 'T_tower', 'T_cntn']
    ],
    Upgrader: [
        ['W_energy', 'H_srcs'],
        ['U_ctrl']
    ]
}

type ResFlow = [
    from:   'storage' | ResSource,
    to:     'storage' | ResSink
]
export const carry_priority: {[role in CarrierRole]:ResFlow[]} = {
    Collector: [
        ['W_link', 'storage'], ['W_cntn', 'storage'], ['sweep', 'storage'],
        ['loot', 'storage'], ['storage', 'T_ext']],
    Supplier: [
        ['W_link', 'storage'], ['storage', 'T_ext'], ['W_energy', 'T_tower'],
        ['storage', 'T_power'], ['storage', 'T_nuker']],
    Chemist: [
        ['storage','T_boost'], ['storage','T_react'], ['compound','storage'],
        ['W_term','storage'], ['W_term', 'storage'], ['storage','T_term']],
    Trader: [
        ['W_link', 'storage'], ['sweep', 'storage'], ['storage', 'T_term']
    ]
}

export const init_carrier_behavior = function(role:CarrierRole,
        fromRoom:string,toRoom:string): CarrierMemory {
    return {
        bhvr_name:  "carrier",
        state:      "idle",
        collect:    [],
        consume:    [],
        find_col:    carry_priority[role][0][0],
        find_con:    carry_priority[role][0][1],
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