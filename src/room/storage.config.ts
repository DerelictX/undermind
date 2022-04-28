type valueof<T> = T[keyof T]
type tier1_comp = keyof typeof REACTIONS.OH
type Oxides = tier1_comp & valueof<typeof REACTIONS.O>
type Hydrides = tier1_comp & valueof<typeof REACTIONS.O>
type tier2_comp = valueof<typeof REACTIONS.X>
type tier3_comp = valueof<typeof REACTIONS.X>

interface store_item_config {
    storage_max:    number
    import_thresh:  number
    export_thresh:  number
}

interface storage_config {
    mineral:    {[m in MineralConstant|MineralBaseCompoundsConstant]:store_item_config}
    boost:      {[m in MineralBoostConstant]:store_item_config}
}