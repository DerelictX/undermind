import _ from "lodash";

export const lab_run = function(room: Room){

    if(room.memory.reaction){
        const labs_in0 = Game.getObjectById(room.memory.structures.labs_in[0]);
        const labs_in1 = Game.getObjectById(room.memory.structures.labs_in[1]);
        if(!labs_in0 || !labs_in1)return
        if(labs_in0.mineralType != room.memory.reaction[0]
            || labs_in1.mineralType != room.memory.reaction[1])
            return
        const labs_out = room.memory.structures.labs_out;
        for(var id in labs_out){
            let lab = Game.getObjectById(labs_out[id]);
            if(!lab || room.memory.boost && room.memory.boost[id])
                continue;
            let ret = lab.runReaction(labs_in0, labs_in1);
            if(ret != OK)
                break;
        }
            
    }
    
}

export const change_reaction = function(room:Room){
    const storage = room.storage
    if(!storage || !storage.my)
        return
    const terminal = room.terminal
    if(!terminal || !terminal.my)
        return
    room.memory.reaction = []
    
    for(let tier = 3; tier >= 0; tier--){
        const reacts = compound_tier[tier]
        for(let i in reacts){
            if(tier < 3 && storage.store[reacts[i]] > 12000)
                continue
            if(storage.store[reacts[i]] > 24000)
                continue
            const reactants = reactions[reacts[i]] 
            if(terminal.store[reactants[0]] >= 1000 && terminal.store[reactants[1]] >= 1000){
                room.memory.reaction = [reactants[0], reactants[1], reacts[i]]
                return
            }
        }
    }
}
_.assign(global, {change_reaction:change_reaction})

const compound_tier:MineralCompoundConstant[][]  = [
    [
        'OH','G','ZK','UL'
    ],[
        'ZO','GO','LO',
        'KO','UH',
        'LH','ZH','GH',
        'KH','UO'
    ],[
        'ZHO2','GHO2','LHO2',
        'KHO2','UH2O',
        'LH2O','ZH2O','GH2O',
        //'KH2O','UHO2'
    ],[
        'XZHO2','XGHO2','XLHO2',
        'XKHO2','XUH2O',
        'XLH2O','XZH2O','XGH2O',
        'XKH2O','XUHO2'
    ]
]

const reactions: {[m in MineralCompoundConstant]:(MineralConstant|MineralCompoundConstant)[]} = {
    OH: ["O","H"],
    ZK: ["Z","K"],
    UL: ["U","L"],
    G:  ["ZK","UL"],

    LH: ["L","H"],
    UH: ["U","H"],
    ZH: ["Z","H"],
    KH: ["K","H"],
    GH: ["G","H"],

    LO: ["L","O"],
    UO: ["U","O"],
    ZO: ["Z","O"],
    KO: ["K","O"],
    GO: ["G","O"],

    LH2O:   ["LH","OH"],
    UH2O:   ["UH","OH"],
    ZH2O:   ["ZH","OH"],
    KH2O:   ["KH","OH"],
    GH2O:   ["GH","OH"],

    LHO2:   ["LO","OH"],
    UHO2:   ["UO","OH"],
    ZHO2:   ["ZO","OH"],
    KHO2:   ["KO","OH"],
    GHO2:   ["GO","OH"],

    XLH2O:   ["LH2O","X"],
    XUH2O:   ["UH2O","X"],
    XZH2O:   ["ZH2O","X"],
    XKH2O:   ["KH2O","X"],
    XGH2O:   ["GH2O","X"],

    XLHO2:   ["LHO2","X"],
    XUHO2:   ["UHO2","X"],
    XZHO2:   ["ZHO2","X"],
    XKHO2:   ["KHO2","X"],
    XGHO2:   ["GHO2","X"],
}
