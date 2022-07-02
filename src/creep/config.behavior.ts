type EnWorkerPriority = [from: EnSource[], to: EnSink[]]

export const work_priority: {[role in EnergyRole]:EnWorkerPriority} = {
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
    [r in CarrierRole]: (fromRoom:string, toRoom:string) => CarrierMemory
} & {
    [r in EnergyRole]: (fromRoom:string, toRoom:string) => WorkerMemory
}

export const class_memory_initializer: class_memory_initializer = {
    Collector: function (fromRoom: string, toRoom: string): CarrierMemory {
        return init_carrier_behavior('Collector',fromRoom,toRoom)
    },
    Supplier: function (fromRoom: string, toRoom: string): CarrierMemory {
        return init_carrier_behavior('Supplier',fromRoom,toRoom)
    },
    Chemist: function (fromRoom: string, toRoom: string): CarrierMemory {
        return init_carrier_behavior('Chemist',fromRoom,toRoom)
    },

    HarvesterSource0: function (fromRoom: string, toRoom: string): WorkerMemory {
        return init_worker_behavior('HarvesterSource0',fromRoom,toRoom)
    },
    HarvesterSource1: function (fromRoom: string, toRoom: string): WorkerMemory {
        return init_worker_behavior('HarvesterSource1',fromRoom,toRoom)
    },
    HarvesterSource2: function (fromRoom: string, toRoom: string): WorkerMemory {
        return init_worker_behavior('HarvesterSource2',fromRoom,toRoom)
    },
    Upgrader: function (fromRoom: string, toRoom: string): WorkerMemory {
        return init_worker_behavior('Upgrader',fromRoom,toRoom)
    },

    Builder: function (fromRoom: string, toRoom: string): WorkerMemory {
        return init_worker_behavior('Builder',fromRoom,toRoom)
    },
    Maintainer: function (fromRoom: string, toRoom: string): WorkerMemory {
        return init_worker_behavior('Maintainer',fromRoom,toRoom)
    },
    EnergySupplier: function (fromRoom: string, toRoom: string): WorkerMemory {
        return init_worker_behavior('EnergySupplier',fromRoom,toRoom)
    }
}