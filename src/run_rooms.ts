import {spawn_run} from "./structure/lv1_spawn";
import {tower_run} from "./structure/lv3_tower";
import {link_run} from "./structure/lv5_link";
import {lab_run} from "./structure/lv6_lab";
import {terminal_run} from "./structure/lv6_terminal";
import {factory_run} from "./structure/lv7_factory";
import {power_spawn_run} from "./structure/lv8_power_spawn";
import {observer_run} from "./structure/lv8_observer";
import {inspect_memory} from "./room/memory.inspector";

export const run_rooms = function () {
    for (let name in Memory.rooms) {
        try {
            const room = Game.rooms[name];
            if (!room) {
                continue
            }
            spawn_run(room)
            tower_run(room)
            link_run(room)
            lab_run(room)
            continue
            factory_run(room)
            power_spawn_run(room)
            observer_run(room)
            terminal_run(room)
        } catch (error) {
            console.log(name + ':\t' + error);
            inspect_memory(name, false)
        }
    }
}
