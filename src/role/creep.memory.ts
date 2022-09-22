
interface CreepMemory extends MoveMemory {
    _class:     CarrierMemory|WorkerMemory|CallbackBehavior<AnyAction>
    _caller:    SpawnTask['_caller']
}

type CarrierRole =
    |"Collector"|"Supplier"|"Chemist"
interface CarrierMemory {
    bhvr_name:  "carrier"
    
    state:      "collect"|"consume"|"idle"
    collect:    CallbackBehavior<AnyAction>[]
    consume:    CallbackBehavior<AnyAction>[]
    current:    ResFlow

    fromRoom:   string
    toRoom:     string
    priority:   CarrierRole
}

type EnergyRole =
    |"HarvesterSource0"|"HarvesterSource1"|"HarvesterSource2"
    |"Upgrader"|"Builder"|"Maintainer"|'EnergySupplier'
    |"RMaintainer"
interface WorkerMemory {
    bhvr_name:  "worker"
    
    state:      "collect"|"consume"
    collect:    CallbackBehavior<AnyAction>[]
    consume:    CallbackBehavior<AnyAction>[]

    fromRoom:   string
    toRoom:     string
    priority:   EnergyRole
}

interface StaticMemory {
    bhvr_name:  "static"
    
    state:      "collect"|"consume"
    collect:    CallbackBehavior<'harvest'|'withdraw'>[]
    consume:    CallbackBehavior<'repair'|'build'|'transfer'>[]
    buff_in:    CallbackBehavior<'withdraw'>[]
    buff_out:   CallbackBehavior<'transfer'>[]
}