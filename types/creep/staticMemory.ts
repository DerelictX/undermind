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