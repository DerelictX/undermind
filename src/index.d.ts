
type StorePropertiesOnly = { [P in ResourceConstant]: number } &
    { [P in Exclude<ResourceConstant, ResourceConstant>]: 0 }
    
type Looper = {
    reload_time:    number
    interval:       number
}

interface Memory {
    owned_rooms: string[]
}