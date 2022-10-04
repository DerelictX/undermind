export {};

declare global {
    var _move_intents:  {[room:string] : undefined | RoomMoveIntents}
    var commonMatrix:   {[room:string] : undefined | number[]}
    var squardMatrix:   {[room:string] : undefined | number[]}
    var _dynamic:   Partial<Record<string,{
        [k in keyof DynamicTaskPool]?: DynamicTaskPool[k]
    }>>
}
