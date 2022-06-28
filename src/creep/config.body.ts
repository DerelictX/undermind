import _ from "lodash"

type body_generator_name = "WCM" | "W2M" | "W2cM" | "C2M" | "ClM"

export const body_generator:{[c in body_generator_name]:
    (energy_cost:number,workload:number)=>BodyPartConstant[]
} = {
    WCM:function(energy_cost:number,workload:number){
        const yy = BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE]
        const xx = Math.min(energy_cost/yy,50/3,workload)
        if(xx < 1) return []
        let ret:BodyPartConstant[] = []
        for(let i = 1; i <= xx; i++)
            ret.push(WORK)
        for(let i = 1; i <= xx; i++)
            ret.push(CARRY)
        for(let i = 1; i <= xx; i++)
            ret.push(MOVE)
        return ret
    },
    W2M:function(energy_cost:number,workload:number){
        const yy = BODYPART_COST[WORK] * 2 + BODYPART_COST[MOVE]
        const xx = Math.min(energy_cost/yy,50/3,workload)
        if(xx < 1) return []
        let ret:BodyPartConstant[] = []
        for(let i = 1; i <= xx; i++){
            ret.push(WORK)
            ret.push(WORK)
        }
        for(let i = 1; i <= xx; i++)
            ret.push(MOVE)
        return ret
    },
    W2cM:function(energy_cost:number,workload:number){
        const yy = BODYPART_COST[WORK] * 2 + BODYPART_COST[MOVE]
        const xx = Math.min((energy_cost-BODYPART_COST[CARRY])/yy,49/3,workload)
        if(xx < 1) return []
        let ret:BodyPartConstant[] = []
        for(let i = 1; i <= xx; i++){
            ret.push(WORK)
            ret.push(WORK)
        }
        ret.push(CARRY)
        for(let i = 1; i <= xx; i++)
            ret.push(MOVE)
        return ret
    },
    C2M:function(energy_cost:number,workload:number){
        const yy = BODYPART_COST[CARRY] * 2 + BODYPART_COST[MOVE]
        const xx = Math.min(energy_cost/yy,50/3,workload)
        if(xx < 1) return []
        let ret:BodyPartConstant[] = []
        for(let i = 1; i <= 2 * xx; i++)
            ret.push(CARRY)
        for(let i = 1; i <= xx; i++)
            ret.push(MOVE)
        return ret
    },
    ClM:function(energy_cost:number,workload:number){
        const yy = BODYPART_COST[CLAIM] + BODYPART_COST[MOVE]
        const xx = Math.min(energy_cost/yy,50/2,workload)
        if(xx < 1) return []
        let ret:BodyPartConstant[] = []
        for(let i = 1; i <= xx; i++)
            ret.push(CLAIM)
        for(let i = 1; i <= xx; i++)
            ret.push(MOVE)
        return ret
    },
}
_.assign(global, {body_generator:body_generator})

export const default_body_config: {[R in GeneralistRole]:
    {generator:body_generator_name ,workload:number}
} = {
    HS0: {generator: "W2cM", workload: 3},
    HS1: {generator: "W2cM", workload: 3},
    HS2: {generator: "W2cM", workload: 3},
    HM: {generator: "W2cM", workload: 7},
    Up: {generator: "W2cM", workload: 5},
    HD: {generator: "WCM", workload: 4},

    Bu: {generator: "WCM", workload: 6},
    Ma: {generator: "WCM", workload: 4},
    Co: {generator: "C2M", workload: 4},
    Su: {generator: "C2M", workload: 4},
    Ch: {generator: "C2M", workload: 4},
}