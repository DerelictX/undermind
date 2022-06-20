
interface CreepMemory {
    behavior?:   CallbackfulBehavior<AnyAction>
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

type AnyRoleName = GeneralistRoleName|SpecialistRoleName|CarrierRoleName|FighterRoleName

type CarrierRoleName = 'collector'|'supplier'|'emergency'
type FighterRoleName = 'melee'|'ranged'|'healer'
type GeneralistRoleName = 'builder'|'maintainer'|'fortifier'|'pioneer'
type SpecialistRoleName = 'upgrader_s'
    |'harvester_s0'|'harvester_s1'|'harvester_m'
    |'reserver'