type AnyClassMemory = CarrierMemory|FighterMemory|GeneralistMemory|SpecialistMemory

interface CreepMemory {
    class_memory:   AnyClassMemory
    spawn_room:     string
    resource_room:  string
    target_room:    string
    boost_queue:    {
        part:BodyPartConstant
        boost:MineralBoostConstant}[]
}

type AnyRoleName = GeneralistRoleName|SpecialistRoleName|CarrierRoleName|FighterRoleName

//-------------------------------------------CARRIER-------------------------------------------//

type CarrierRoleName = 'collector'|'supplier'|'emergency'
type TransportState = 'collect'|'supply'

interface CarrierMemory {
    class:  'carrier'
    role:   CarrierRoleName

    state:      TransportState
    collect:    TransportTask[]
    supply:     TransportTask[]
}

//-------------------------------------------FIGHTER-------------------------------------------//

type FighterRoleName = 'melee'|'ranged'|'healer'

interface FighterMemory {
    class:  'fighter'
    role:   FighterRoleName
}

//-------------------------------------------WORKER--------------------------------------------//

type GeneralistRoleName = 'builder'|'maintainer'|'fortifier'|'pioneer'
type GeneralistState = 'obtain'|'consume'
interface GeneralistMemory {
    class:  'generalist'
    role:   GeneralistRoleName

    state:      GeneralistState
    obtain?:     ObtainTask
    consume?:    ConsumeTask
}

type SpecialistRoleName = 'upgrader_s'
    |'harvester_s0'|'harvester_s1'|'harvester_m'
    |'reserver'
interface SpecialistMemory {
    class:  'specialist'
    role:   SpecialistRoleName
}