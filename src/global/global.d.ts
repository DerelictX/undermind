export {};

declare global {
    var _move_intents:  {[room:string] : undefined | RoomMoveIntents}
    var commonMatrix:   {[room:string] : undefined | number[]}
    var squardMatrix:   {[room:string] : undefined | number[]}

    var _collect:   RoomRecord<{[k in keyof CollectTaskCache]?: CollectTaskCache[k]}>
    var _consume:   RoomRecord<{[k in keyof ConsumeTaskCache]?: ConsumeTaskCache[k]}>
}
