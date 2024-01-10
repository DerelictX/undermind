interface WorkerMemory {
    bhvr_name: "worker"

    state: "collect" | "consume"
    collect: CallbackBehavior<PrimitiveAction>[]
    consume: CallbackBehavior<PrimitiveAction>[]

    fromRoom: string
    toRoom: string
    priority: EnergyRole
}

type EnergyRole =
    | "Builder" | "Maintainer" | 'EnergySupplier' | "Upgrader"