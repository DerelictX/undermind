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

type CarrierRole =
    | "Collector" | "Supplier" | "Chemist" | "Trader"