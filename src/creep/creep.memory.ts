
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
    |"HS0"|"HS1"|"HS2"|"HM"|"Up"
    |"HD"|"Bu"|"Ma"|"Co"|"Su"|"Ch"
