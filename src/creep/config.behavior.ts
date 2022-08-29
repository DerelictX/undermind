type EnWorkerPriority = [from: EnSource[], to: EnSink[]]

export const work_priority: {[role in EnergyRole]:EnWorkerPriority} = {
    HarvesterSource0: [['H_src0'], ['T_src0']],
    HarvesterSource1: [['H_src1'], ['T_src1']],
    HarvesterSource2: [['H_src2'], ['T_src2']],
    Upgrader: [['W_ctrl'], ['U_ctrl']],
    Builder: [
        ['W_energy', 'H_srcs'],
        ['repair', 'anti_nuke', 'build', 'fortify', 'U_ctrl']],
    Maintainer: [
        ['W_energy', 'H_srcs'],
        ['repair', 'downgraded', 'decayed', 'fortify', 'U_ctrl']],
    EnergySupplier: [
        ['W_energy'],
        ['T_ext', 'T_tower', 'T_cntn']]
}

export const carry_priority: {[role in CarrierRole]:ResFlow[]} = {
    Collector: [
        ['W_cntn', 'storage'], ['sweep', 'storage'], ['loot', 'storage']],
    Supplier: [
        ['W_energy', 'T_ext'], ['W_energy', 'T_tower'],
        ['storage', 'T_power'], ['storage', 'T_nuker']],
    Chemist: [
        ['storage','T_boost'], ['storage','T_react'], ['compound','storage']]
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