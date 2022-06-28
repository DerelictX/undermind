
const priority: {[role in GeneralistRole]:ResFlow[]} = {    
    HarvesterSource0:   [['H_src0','T_src0']],
    HarvesterSource1:   [['H_src1','T_src1']],
    HarvesterSource2:   [['H_src2','T_src2']],
    HarvesterMineral:   [['H_mnrl','T_mnrl']],
    HarvesterDeposit:   [['deposit','lazy']],
    Upgrader:           [['W_ctrl','U_ctrl']],

    Builder:    [['lazy','repair'], ['lazy','anti_nuke'],['lazy','build'],  ['lazy','fortify'], ['lazy','U_ctrl']],
    Maintainer: [['lazy','repair'], ['lazy','T_ext'],['lazy','downgraded'], ['lazy','decayed'], ['lazy','U_ctrl']],

    Collector:  [['lazy','T_ctrl'], ['W_srcs','lazy'],  ['sweep','lazy'],   ['loot','lazy']],
    Supplier:   [['lazy','T_ext'],  ['lazy','T_tower'], ['lazy','T_ctrl'],  ['lazy','T_power']],
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