
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

type GeneralistRole =
    |"HarvesterSource0"|"HarvesterSource1"|"HarvesterSource2"
    |"HarvesterMineral"|"Upgrader"|"HarvesterDeposit"
    |"Builder"|"Maintainer"|"Collector"|"Supplier"|"Chemist"
