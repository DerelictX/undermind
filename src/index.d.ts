
type StorePropertiesOnly = { [P in ResourceConstant]: number } &
    { [P in Exclude<ResourceConstant, ResourceConstant>]: 0 }
    
type Looper = {
    reload_time:    number
    interval:       number
}

interface Memory {
    creep_SN:   number
}

type ValueTypes<T> = T[keyof T]
type tier1_comp = keyof typeof REACTIONS.OH
type Oxides = tier1_comp & ValueTypes<typeof REACTIONS.O>
type Hydrides = tier1_comp & ValueTypes<typeof REACTIONS.O>
type tier2_comp = ValueTypes<typeof REACTIONS.X>
type tier3_comp = ValueTypes<typeof REACTIONS.X>

interface store_item_config {
    storage_max:    number
    import_thresh:  number
    export_thresh:  number
}

interface storage_config {
    mineral:    {[m in MineralConstant|MineralBaseCompoundsConstant]:store_item_config}
    boost:      {[m in MineralBoostConstant]:store_item_config}
}