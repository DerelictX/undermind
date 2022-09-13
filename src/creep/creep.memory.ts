
interface CreepMemory {
    _class:     CarrierMemory|WorkerMemory|CallbackBehavior<AnyAction>
    _caller:    SpawnTask['_caller']
    _move?:{
        dest: {x:number,y:number,room:string},
        time: number,
        path: string,
        room: string
    }
    _hike?:{
        from:   string
        to:     string
        route:{
            exit: ExitConstant
            room: string
        }[]
    }
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
interface WorkerMemory {
    bhvr_name:  "worker"
    
    state:      "collect"|"consume"
    collect:    CallbackBehavior<AnyAction>[]
    consume:    CallbackBehavior<AnyAction>[]

    fromRoom:   string
    toRoom:     string
    priority:   EnergyRole
}
