interface RoomMemory extends Partial<RoomStructureList> {
    
}

type owned_room_role =
    |"Source0"|"Source1"|'Mineral'
    |"Upgrade"|"Build"|"Maintain"
    |"Collector"|"Supplier"

type reserved_room_role =
    |"Source0"|"Source1"|"Reserve"
    |"Build"|"Maintain"
    |"Collector"

type highway_room_role =
    |"Deposit"|"Collector"

type claimed_room_role =
    |"Claim"|"Upgrade"|"Build"

/**白板房，啥也不干 */
type ObserveThis = {Observe:Looper}