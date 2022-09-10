type SpawnTask = {
    _caller: {
        room_name:  string
        looper:     AnyRole
    }
    _body:  {
        generator:  body_generator_name
        workload:   number
        mobility?:  number
    }
    _class:     CreepMemory['_class']
}

type body_generator_name =
    | "W" | "C" | "WC" | "Wc"
    | "A" | "R" | "H" | "Cl"
    | "DH"