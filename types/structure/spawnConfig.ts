interface SpawnConfig {
    t0: SpawnTask[]
    t1: SpawnTask[]
    t2: SpawnTask[]
    t3: SpawnTask[]
}

type SpawnTask = {
    _caller: string
    _body: CreepBodyConfig
    _class: CreepMemory['_class']
}

type body_generator_name =
    | "W" | "C" | "WC" | "Wc"
    | "A" | "R" | "H" | "Cl"
    | "DH"

type CreepBodyConfig = {
    generator: body_generator_name
    workload: number
    mobility?: number
    boost?: Partial<Record<BodyPartConstant, MineralBoostConstant>>
}
