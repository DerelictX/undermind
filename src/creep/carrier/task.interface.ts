
interface TransportTask{
    source:         Id<AnyStoreStructure|Tombstone|Ruin>
    target:         Id<AnyCreep|AnyStoreStructure>
    resourceType:   ResourceConstant
    amount:         number
}

interface TransferTask {
    target:         Id<AnyCreep|AnyStoreStructure>
    resourceType:   ResourceConstant
    amount:         number
}

interface WithdrawTask {
    target:         Id<AnyStoreStructure|Tombstone|Ruin>
    resourceType:   ResourceConstant
    amount:         number
}