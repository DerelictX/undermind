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
        ['repair', 'downgraded', 'decayed', 'U_ctrl']],
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

const init_carrier_behavior = function(role:CarrierRole,
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

const init_worker_behavior = function(role:EnergyRole,
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

type class_memory_initializer = {
    [r in CarrierRole]: (spawnRoom:string, requestRoom:string) => CarrierMemory
} & {
    [r in EnergyRole]: (spawnRoom:string, requestRoom:string) => WorkerMemory
}

export const class_memory_initializer: class_memory_initializer = {
    Collector: function (spawnRoom:string, requestRoom:string): CarrierMemory {
        return init_carrier_behavior('Collector',requestRoom,spawnRoom)
    },
    Supplier: function (spawnRoom:string, requestRoom:string): CarrierMemory {
        return init_carrier_behavior('Supplier',spawnRoom,requestRoom)
    },
    Chemist: function (spawnRoom:string, requestRoom:string): CarrierMemory {
        return init_carrier_behavior('Chemist',requestRoom,requestRoom)
    },

    HarvesterSource0: function (spawnRoom:string, requestRoom:string): WorkerMemory {
        return init_worker_behavior('HarvesterSource0',requestRoom,requestRoom)
    },
    HarvesterSource1: function (spawnRoom:string, requestRoom:string): WorkerMemory {
        return init_worker_behavior('HarvesterSource1',requestRoom,requestRoom)
    },
    HarvesterSource2: function (spawnRoom:string, requestRoom:string): WorkerMemory {
        return init_worker_behavior('HarvesterSource2',requestRoom,requestRoom)
    },
    Upgrader: function (spawnRoom:string, requestRoom:string): WorkerMemory {
        return init_worker_behavior('Upgrader',requestRoom,requestRoom)
    },

    Builder: function (spawnRoom:string, requestRoom:string): WorkerMemory {
        return init_worker_behavior('Builder',spawnRoom,requestRoom)
    },
    Maintainer: function (spawnRoom:string, requestRoom:string): WorkerMemory {
        return init_worker_behavior('Maintainer',spawnRoom,requestRoom)
    },
    EnergySupplier: function (spawnRoom:string, requestRoom:string): WorkerMemory {
        return init_worker_behavior('EnergySupplier',requestRoom,spawnRoom)
    }
}