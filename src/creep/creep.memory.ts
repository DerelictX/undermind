
interface CreepMemory {
    behavior?:  AnyBehavior
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

type CreepClassName = 'generalist'|'specialist'|'carrier'|'fighter'

type EnergyRole =
    |"HarvesterSource0"|"HarvesterSource1"|"HarvesterSource2"
    |"Upgrader"|"Builder"|"Maintainer"
    |"Collector"|"Supplier"

type CarrierRole =
    |"HarvesterMineral"|"HarvesterDeposit"
    |"Collector"|"Supplier"|"Chemist"
