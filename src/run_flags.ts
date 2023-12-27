import {loop_flags} from "@/controller/loopFlags";

export const run_flags = function () {
    for (let name in Memory.flags) {
        try {
            const flag = Game.flags[name]
            if (!flag || flag.memory._class != '_loop') {
                continue
            }
            loop_flags(flag)
        } catch (error) {
            console.log(name + ':\t' + error);
        }
    }
}