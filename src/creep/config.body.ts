import _, { ceil } from "lodash"

type body_generator_name =
    | "W" | "C" | "WC" | "Wc"
    | "A" | "R" | "H" | "Cl"

export const body_generator:{[c in body_generator_name]:
    (workload:number)=>BodyPartConstant[]
} = {
    WC: function (workload: number): BodyPartConstant[] {
        return new Array(ceil(workload * 0.5)).fill(WORK)
        .concat(new Array(ceil(workload * 0.5)).fill(WORK))
    },
    Wc: function (workload: number): BodyPartConstant[] {
        return new Array(ceil(workload * 0.8)).fill(WORK)
        .concat(new Array(ceil(workload * 0.2)).fill(WORK))
    },
    Cl: function (workload: number): BodyPartConstant[] {
        return new Array(workload).fill(CLAIM)
    },
    W: function (workload: number): BodyPartConstant[] {
        return new Array(workload).fill(WORK)
    },
    C: function (workload: number): BodyPartConstant[] {
        return new Array(workload).fill(CARRY)
    },
    A: function (workload: number): BodyPartConstant[] {
        return new Array(workload).fill(ATTACK)
    },
    H: function (workload: number): BodyPartConstant[] {
        return new Array(workload).fill(HEAL)
    },
    R: function (workload: number): BodyPartConstant[] {
        return new Array(workload).fill(RANGED_ATTACK)
    }
}
_.assign(global, {body_generator:body_generator})

export const default_body_config: {[R in AnyRole]: body_generator_name} = {
    HarvesterSource0:   "Wc",
    HarvesterSource1:   "Wc",
    HarvesterSource2:   "Wc",
    HarvesterMineral:   "Wc",
    HarvesterDeposit:   "Wc",

    Upgrader:       "Wc",
    Builder:        "WC",
    Maintainer:     "WC",
    EnergySupplier: "C",

    Collector:  "C",
    Supplier:   "C",
    Chemist:    "C",
}