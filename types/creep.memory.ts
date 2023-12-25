interface CreepMemory extends MoveMemory {
    _class: | CarrierMemory | WorkerMemory | StaticMemory
    _caller: SpawnCaller<AnyLoopType>
    _life: CreepLifeCycle
}

type CarrierRole =
    | "Collector" | "Supplier" | "Chemist" | "Trader"

interface CarrierMemory {
    bhvr_name: "carrier"

    state: "collect" | "consume" | "idle"
    collect: CallbackBehavior<PrimitiveAction>[]
    consume: CallbackBehavior<PrimitiveAction>[]
    find_col: 'storage' | ResSource
    find_con: 'storage' | ResSink

    fromRoom: string
    toRoom: string
    priority: CarrierRole
}

type EnergyRole =
    | "Builder" | "Maintainer" | 'EnergySupplier' | "Upgrader"

interface WorkerMemory {
    bhvr_name: "worker"

    state: "collect" | "consume"
    collect: CallbackBehavior<PrimitiveAction>[]
    consume: CallbackBehavior<PrimitiveAction>[]

    fromRoom: string
    toRoom: string
    priority: EnergyRole
}

interface StaticMemory {
    bhvr_name: "static"
    state: "collect" | "consume"
    col?: CallbackBehavior<PrimitiveAction>
    con?: CallbackBehavior<PrimitiveAction>
    collect: CallbackBehavior<PrimitiveAction>[]
    consume: CallbackBehavior<PrimitiveAction>[]
    buff_in?: CallbackBehavior<'withdraw'>[]
    buff_out?: CallbackBehavior<'transfer'>[]
}