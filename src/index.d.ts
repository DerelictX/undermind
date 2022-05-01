
type StorePropertiesOnly = { [P in ResourceConstant]: number } &
    { [P in Exclude<ResourceConstant, ResourceConstant>]: 0 };
    
    interface Memory {
        owned_rooms: string[]
    }