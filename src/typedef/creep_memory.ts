
interface CreepMemory {
    _class:     CreepClassName
    behavior?:  CallbackfulBehavior<AnyAction>
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