
type StorePropertiesOnly = { [P in ResourceConstant]: number } &
    { [P in Exclude<ResourceConstant, ResourceConstant>]: 0 };
    
type TaskReturnCode = 'idle'|'doing'|'error'|'done_one'|'done_all'
