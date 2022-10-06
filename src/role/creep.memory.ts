
interface CreepMemory extends MoveMemory {
    _class:     | CarrierMemory | WorkerMemory | StaticMemory
    _caller:    SpawnCaller<RoomTypes>
    _life:      CreepLifeCycle
}

type CarrierRole =
    |"Collector"|"Supplier"|"Chemist"
interface CarrierMemory {
    bhvr_name:  "carrier"
    
    state:      "collect"|"consume"|"idle"
    collect:    CallbackBehavior<PrimitiveAction>[]
    consume:    CallbackBehavior<PrimitiveAction>[]
    current:    ResFlow

    fromRoom:   string
    toRoom:     string
    priority:   CarrierRole
}

type EnergyRole =
    |"Upgrader"|"Builder"|"Maintainer"|'EnergySupplier'
    |"RMaintainer"
interface WorkerMemory {
    bhvr_name:  "worker"
    
    state:      "collect"|"consume"
    collect:    CallbackBehavior<PrimitiveAction>[]
    consume:    CallbackBehavior<PrimitiveAction>[]

    fromRoom:   string
    toRoom:     string
    priority:   EnergyRole
}

interface StaticMemory {
    bhvr_name:  "static"
    state:      "collect"|"consume"
    col?:       CallbackBehavior<PrimitiveAction>
    con?:       CallbackBehavior<PrimitiveAction>
    collect:    CallbackBehavior<PrimitiveAction>[]
    consume:    CallbackBehavior<PrimitiveAction>[]
    buff_in?:   CallbackBehavior<'withdraw'>[]
    buff_out?:  CallbackBehavior<'transfer'>[]
}