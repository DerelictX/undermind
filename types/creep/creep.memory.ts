interface CreepMemory extends MoveMemory {
    _class: | CarrierMemory | WorkerMemory | StaticMemory | FighterMemory | ManualMemory
    _caller: string
    _life: CreepLifeCycle
}

type CreepLifeCycle = {
    boost?: Partial<Record<BodyPartConstant, MineralBoostConstant>>
    boost_room?: string
    unboost?: string
}

interface ManualMemory {
    bhvr_name: "manual"
}