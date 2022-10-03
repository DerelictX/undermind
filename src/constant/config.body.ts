import _, { ceil } from "lodash"

export const body_generator:{[c in body_generator_name]:
    (workload: number, mobility: number)=>BodyPartConstant[]
} = {
    WC: function (workload: number, mobility: number): BodyPartConstant[] {
        var ret: BodyPartConstant[] = []
        ret = ret.concat(new Array(ceil(workload * 0.5)).fill(WORK))
        ret = ret.concat(new Array(ceil(workload * 0.5)).fill(CARRY))
        return ret.concat(new Array(ceil(ret.length / mobility)).fill(MOVE))
    },
    Wc: function (workload: number, mobility: number): BodyPartConstant[] {
        var ret: BodyPartConstant[] = []
        ret = ret.concat(new Array(ceil(workload)).fill(WORK))
        ret = ret.concat(new Array(ceil(ret.length / mobility)).fill(MOVE))
        return ret.concat(new Array(ceil(workload * 0.2)).fill(CARRY))
    },
    Cl: function (workload: number, mobility: number): BodyPartConstant[] {
        var ret: BodyPartConstant[] = new Array(workload).fill(CLAIM)
        return ret.concat(new Array(ceil(ret.length / mobility)).fill(MOVE))
    },
    W: function (workload: number, mobility: number): BodyPartConstant[] {
        var ret: BodyPartConstant[] = new Array(workload).fill(WORK)
        return ret.concat(new Array(ceil(ret.length / mobility)).fill(MOVE))
    },
    C: function (workload: number, mobility: number): BodyPartConstant[] {
        var ret: BodyPartConstant[] = new Array(workload).fill(CARRY)
        return ret.concat(new Array(ceil(ret.length / mobility)).fill(MOVE))
    },
    A: function (workload: number, mobility: number): BodyPartConstant[] {
        var ret: BodyPartConstant[] = new Array(workload).fill(ATTACK)
        return ret.concat(new Array(ceil(ret.length / mobility)).fill(MOVE))
    },
    H: function (workload: number, mobility: number): BodyPartConstant[] {
        var ret: BodyPartConstant[] = new Array(workload).fill(HEAL)
        return ret.concat(new Array(ceil(ret.length / mobility)).fill(MOVE))
    },
    R: function (workload: number, mobility: number): BodyPartConstant[] {
        var ret: BodyPartConstant[] = new Array(workload).fill(RANGED_ATTACK)
        return ret.concat(new Array(ceil(ret.length / mobility)).fill(MOVE))
    },
    DH: function (workload: number, mobility: number): BodyPartConstant[] {
        var ret: BodyPartConstant[] = []
        ret = ret.concat(new Array(workload).fill(WORK))
        ret = ret.concat(new Array(25-workload).fill(CARRY))
        return ret.concat(new Array(25).fill(MOVE))
    }
}
_.assign(global, {body_generator:body_generator})