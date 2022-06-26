
const priority: {[role in GeneralistRole]:ResFlow[]} = {    
    HS0:    [['H_src0','T_src0']],
    HS1:    [['H_src1','T_src1']],
    HS2:    [['H_src2','T_src2']],
    HM:     [['H_mnrl','T_mnrl']],
    Up:     [['W_ctrl','U_ctrl']],

    HD: [['deposit','lazy']],
    Bu: [['lazy','repair'], ['lazy','anti_nuke'],['lazy','build'],  ['lazy','fortify'], ['lazy','U_ctrl']],
    Ma: [['lazy','repair'], ['lazy','T_ext'],['lazy','downgraded'], ['lazy','decayed'], ['lazy','U_ctrl']],

    Co: [['lazy','T_ctrl'], ['W_srcs','lazy'],  ['sweep','lazy'],   ['loot','lazy']],
    Su: [['lazy','T_ext'],  ['lazy','T_tower'], ['lazy','T_ctrl'],  ['lazy','T_power']],
    Ch: [['lazy','T_boost'],['lazy','T_react'], ['compound','lazy'],['W_mnrl','lazy']]
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