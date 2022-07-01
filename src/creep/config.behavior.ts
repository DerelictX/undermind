type EnWorkerPriority = [from: EnSource[], to: EnSink[]]

const work_priority: {[role in EnergyRole]:EnWorkerPriority} = {
    HarvesterSource0: [['H_src0'], ['T_src0']],
    HarvesterSource1: [['H_src1'], ['T_src1']],
    HarvesterSource2: [['H_src2'], ['T_src2']],
    Upgrader: [['W_ctrl'], ['U_ctrl']],
    Builder: [
        ['W_srcs', 'H_srcs'],
        ['repair', 'anti_nuke', 'build', 'fortify', 'U_ctrl']
    ],
    Maintainer: [
        ['W_srcs', 'H_srcs'],
        ['repair', 'downgraded', 'decayed', 'U_ctrl']
    ],
    EnergySupplier: [
        ['W_srcs'],
        ['T_ext', 'T_tower', 'T_ctrl']]
}

export const carry_priority: {[role in CarrierRole]:ResFlow[]} = {
    Collector: [['W_srcs', 'T_ctrl'], ['W_srcs', 'storage'], ['sweep', 'storage'], ['loot', 'storage']],
    Supplier: [['W_srcs', 'T_ext'], ['W_srcs', 'T_tower'], ['W_srcs', 'T_ctrl'], ['storage', 'T_power']],
    Chemist: [['storage','T_boost'], ['storage','T_react'], ['compound','storage'], ['W_mnrl','storage']]
}

export const default_generalist_behavior = function(role:CarrierRole,
        fromRoom:string,toRoom:string): FlowBehavior {
    return {
        bhvr_name:  "flow",
        state:      "idle",
        collect:    [],
        consume:    [],
        current:    carry_priority[role][0],
        fromRoom:   fromRoom,
        toRoom:     toRoom,
        priority:   role
    }
}