
interface CreepMemory {
    _class: CreepClassMemory
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

type AnyRole = |EnergyRole|CarrierRole|MineralWorker
type CreepClassMemory = CarrierMemory|WorkerMemory

type EnergyRole =
    |"HarvesterSource0"|"HarvesterSource1"|"HarvesterSource2"
    |"Upgrader"|"Builder"|"Maintainer"|'EnergySupplier'

type CarrierRole =
    |"Collector"|"Supplier"|"Chemist"

type MineralWorker = |'HarvesterMineral'|'HarvesterDeposit'

type StoreLessRole = |'Reserver'

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

interface WorkerMemory {
    bhvr_name:  "worker"
    
    state:      "collect"|"consume"
    collect:    CallbackBehavior<AnyAction>[]
    consume:    CallbackBehavior<AnyAction>[]

    fromRoom:   string
    toRoom:     string
    priority:   EnergyRole
}
