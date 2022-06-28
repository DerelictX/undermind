
const priority: {[role in GeneralistRole]:ResFlow[]} = {    
    HarvesterSource0:   [['H_src0','R_src0']],
    HarvesterSource1:   [['H_src1','R_src1']],
    HarvesterSource2:   [['H_src2','R_src2']],
    HarvesterMineral:   [['H_mnrl','T_mnrl']],
    HarvesterDeposit:   [['deposit','lazy']],
    Upgrader:           [['W_ctrl','U_ctrl']],

    Builder:    [['W_srcs','repair'],   ['W_srcs','anti_nuke'], ['W_srcs','build'],
                ['W_srcs','fortify'],   ['W_srcs','U_ctrl'],    ['H_srcs','build'],],
    Maintainer: [['W_srcs','repair'],   ['lazy','downgraded'], ['W_srcs','decayed'], ['lazy','U_ctrl']],

    Collector:  [['W_srcs','T_ctrl'], ['W_srcs','lazy'],  ['sweep','lazy'],   ['loot','lazy']],
    Supplier:   [['W_srcs','T_ext'],  ['W_srcs','T_tower'], ['W_srcs','T_ctrl'],  ['lazy','T_power']],
    Chemist:    [['lazy','T_boost'],['lazy','T_react'], ['compound','lazy'],['W_mnrl','lazy']]
}

export const default_generalist_behavior = function(role:GeneralistRole,
        fromRoom:string,toRoom:string): FlowBehavior {
    return {
        bhvr_name:  "flow",
        state:      "idle",
        collect:    [],
        consume:    [],
        current:    priority[role][0],
        fromRoom:   fromRoom,
        toRoom:     toRoom,
        priority:   priority[role]
    }
}