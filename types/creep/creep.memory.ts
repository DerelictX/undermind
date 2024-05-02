interface CreepMemory extends MoveMemory {
    _class: | CarrierMemory | WorkerMemory | StaticMemory | FighterMemory
    _caller: string
    _life: CreepLifeCycle
}

type CreepLifeCycle = {
    boost?: Partial<Record<BodyPartConstant, MineralBoostConstant>>
    boost_room?: string
    unboost?: string
}
