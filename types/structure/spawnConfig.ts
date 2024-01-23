interface SpawnConfig {
    t0: CalledSpawnTask[]
    t1: CalledSpawnTask[]
    t2: CalledSpawnTask[]
    t3: CalledSpawnTask[]
}

type SpawnTask = {
    _body: CreepBodyConfig
    _class: CreepMemory['_class']
}

type CalledSpawnTask = {
    _caller: string
} & SpawnTask

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
