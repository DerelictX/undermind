import _ from "lodash"

type body_generator_name = "WCM" | "W2M" | "W2cM" | "C2M"
    | "ClM" | "TH2" | "TA3" | "TR3"

export const body_generator:{[c in body_generator_name]:
    (energy_cost:number,workload:number)=>BodyPartConstant[]
} = {
    WCM:function(energy_cost:number,workload:number){
        const xx = Math.min(energy_cost/200,50/3,workload)
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
        const xx = Math.min(energy_cost/250,50/3,workload)
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
        const xx = Math.min((energy_cost-50)/250,49/3,workload)
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
        const xx = Math.min(energy_cost/150,50/3,workload)
        if(xx < 1) return []
        let ret:BodyPartConstant[] = []
        for(let i = 1; i <= 2 * xx; i++)
            ret.push(CARRY)
        for(let i = 1; i <= xx; i++)
            ret.push(MOVE)
        return ret
    },
    ClM:function(energy_cost:number,workload:number){
        const xx = Math.min(energy_cost/650,50/2,workload)
        if(xx < 1) return []
        let ret:BodyPartConstant[] = []
        for(let i = 1; i <= xx; i++)
            ret.push(CLAIM)
        for(let i = 1; i <= xx; i++)
            ret.push(MOVE)
        return ret
    },
    TH2:function(energy_cost:number,workload:number){
        let ret:BodyPartConstant[] = []
        for(let i = 1; i <= workload; i++)
            ret.push(TOUGH)
        for(let i = 1; i <= 40 - 3 * workload; i++)
            ret.push(RANGED_ATTACK)
        for(let i = 1; i <= 2 * workload; i++)
            ret.push(HEAL)
        for(let i = 1; i <= 10; i++)
            ret.push(MOVE)
        return ret
    },
    TA3:function(energy_cost:number,workload:number){
        return []
    },
    TR3:function(energy_cost:number,workload:number){
        return []
    },
}
_.assign(global, {body_generator:body_generator})

export const default_body_config: {[R in AnyRoleName]:
    {generator:body_generator_name ,workload:number}
} = {
    pioneer:    {generator:'WCM',   workload:6},
    builder:    {generator:'WCM',   workload:4},
    maintainer: {generator:'WCM',   workload:4},
    fortifier:  {generator:'WCM',   workload:16},

    harvester_m:    {generator:'W2M',   workload:9},
    harvester_s0:   {generator:'W2cM',  workload:3},
    harvester_s1:   {generator:'W2cM',  workload:3},
    upgrader_s:     {generator:'W2cM',  workload:5},
    reserver:       {generator:'ClM',   workload:3},

    supplier:   {generator:'C2M',   workload:4},
    collector:  {generator:'C2M',   workload:4},
    emergency:  {generator:'C2M',   workload:2},

    healer:     {generator:'TH2',   workload:10},
    melee:      {generator:'TA3',   workload:10},
    ranged:     {generator:'TR3',   workload:10},
}