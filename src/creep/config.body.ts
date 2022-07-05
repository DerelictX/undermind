import _, { ceil } from "lodash"

type body_generator_name =
    | "WCM" | "W2cM" | "W2M" | "C2M"
    | "WCM2" | "WcM" | "WM" | "CM"
    | "ClM" | "AM" | "HM" | "RM"

export const body_generator:{[c in body_generator_name]:
    (workload:number)=>BodyPartConstant[]
} = {
    WCM: function (workload: number) {
        let ret: BodyPartConstant[] = []
        for (let i = 1; i <= workload; i++)
            ret.push(WORK)
        for (let i = 1; i <= workload; i++)
            ret.push(CARRY)
        for (let i = 1; i <= workload; i++)
            ret.push(MOVE)
        return ret
    },
    W2M: function (workload: number) {
        let ret: BodyPartConstant[] = []
        for (let i = 1; i <= workload; i++)
            ret.push(WORK)
        for (let i = 1; i <= ceil(workload / 2); i++)
            ret.push(MOVE)
        return ret
    },
    W2cM: function (workload: number) {
        let ret: BodyPartConstant[] = []
        for (let i = 1; i <= workload; i++)
            ret.push(WORK)
        ret.push(CARRY)
        for (let i = 1; i <= ceil(workload / 2); i++)
            ret.push(MOVE)
        return ret
    },
    C2M: function (workload: number) {
        let ret: BodyPartConstant[] = []
        for (let i = 1; i <= workload; i++)
            ret.push(CARRY)
        for (let i = 1; i <= ceil(workload / 2); i++)
            ret.push(MOVE)
        return ret
    },
    WCM2: function (workload: number): BodyPartConstant[] {
        let ret: BodyPartConstant[] = []
        for (let i = 1; i <= workload; i++)
            ret.push(WORK)
        for (let i = 1; i <= workload; i++)
            ret.push(CARRY)
        for (let i = 1; i <= workload * 2; i++)
            ret.push(MOVE)
        return ret
    },
    WcM: function (workload: number): BodyPartConstant[] {
        let ret: BodyPartConstant[] = []
        for (let i = 1; i <= workload; i++)
            ret.push(WORK)
        ret.push(CARRY)
        for (let i = 1; i <= workload; i++)
            ret.push(MOVE)
        return ret
    },
    ClM: function (workload: number) {
        let ret: BodyPartConstant[] = []
        for (let i = 1; i <= workload; i++)
            ret.push(CLAIM)
        for (let i = 1; i <= workload; i++)
            ret.push(MOVE)
        return ret
    },
    WM: function (workload: number): BodyPartConstant[] {
        let ret: BodyPartConstant[] = []
        for (let i = 1; i <= workload; i++)
            ret.push(WORK)
        for (let i = 1; i <= workload; i++)
            ret.push(MOVE)
        return ret
    },
    CM: function (workload: number): BodyPartConstant[] {
        let ret: BodyPartConstant[] = []
        for (let i = 1; i <= workload; i++)
            ret.push(CARRY)
        for (let i = 1; i <= workload; i++)
            ret.push(MOVE)
        return ret
    },
    AM: function (workload: number): BodyPartConstant[] {
        let ret: BodyPartConstant[] = []
        for (let i = 1; i <= workload; i++)
            ret.push(ATTACK)
        for (let i = 1; i <= workload; i++)
            ret.push(MOVE)
        return ret
    },
    HM: function (workload: number): BodyPartConstant[] {
        let ret: BodyPartConstant[] = []
        for (let i = 1; i <= workload; i++)
            ret.push(HEAL)
        for (let i = 1; i <= workload; i++)
            ret.push(MOVE)
        return ret
    },
    RM: function (workload: number): BodyPartConstant[] {
        let ret: BodyPartConstant[] = []
        for (let i = 1; i <= workload; i++)
            ret.push(RANGED_ATTACK)
        for (let i = 1; i <= workload; i++)
            ret.push(MOVE)
        return ret
    }
}
_.assign(global, {body_generator:body_generator})

export const default_body_config: {[R in AnyRole]: body_generator_name} = {
    HarvesterSource0: "W2cM",
    HarvesterSource1: "W2cM",
    HarvesterSource2: "W2cM",
    HarvesterMineral: "W2cM",
    HarvesterDeposit: "WCM",
    
    EnergySupplier: "C2M",
    Upgrader: "W2cM",
    Builder: "WCM",
    Maintainer: "WCM",

    Collector: "C2M",
    Supplier: "C2M",
    Chemist: "C2M",
}