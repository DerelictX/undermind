import _ from "lodash";

/**

 特别感谢： @[E29N27|重构咕] CXuesong  提供技术支持

 使用方法：
 require 后，控制台输入：

 1. HelperRoomResource.showAllRes()

 2. 显示后 鼠标放在资源上面会显示全部自己房间的资源

 3. 点击房间 可以跳转到房间

 */
const tips = function (text: string, tipStrArray: string[], id: number, left: number) {
    left = left - 1;
    left *= 100;
    const showCore = tipStrArray.map(e =>
        `<t onclick="goto('${e}')"> ${e} </t>`.replace(/[\\"]/g, '%')
    ).join("<br>")
    const time = Game.time;
    return `<t class="a${id}-a${time}">${text}</t><script>
function goto(e){
    let roomName = e.split(":")[0].replace(/\\s+/g, "");
    window.location.href = window.location.href.substring(0,window.location.href.lastIndexOf("/")+1)+roomName;
};
(() => {
    const button = document.querySelector(".a${id}-a${time}");
    let tip;
    button.addEventListener("pointerenter", () => {
        tip = document.createElement("div");
        tip.style.backgroundColor = "rgba(43,43,43,1)"; 
        tip.style.border = "1px solid";
        tip.style.borderColor = "#ccc";
        tip.style.borderRadius = "5px";
        tip.style.position = "absolute";
        tip.style.zIndex=10;
        tip.style.color = "#ccc";
        tip.style.marginLeft = "${left}px";
        tip.width = "230px";
        tip.innerHTML = "${showCore}".replace(/[\\%]/g,'"'); button.append(tip);
    });
    button.addEventListener("pointerleave", () => {tip && (tip.remove(), tip = undefined);});
    })()
</script>
`.replace(/[\r\n]/g, "");
}


//alert(window.location.href.substr(0,window.location.href.lastIndexOf("/")+1)+roomName);
export const HelperRoomResource = {

    getStorageTerminalRes: function (room: Room) {
        const storage = room.storage
        const terminal = room.terminal
        const config = room.memory.factory
        const factory = config?.fact_id ? Game.getObjectById(config.fact_id) : null

        const store: Partial<StorePropertiesOnly> = {};
        if (storage?.my) this.addStore(store, storage.store)
        if (terminal?.my) this.addStore(store, terminal.store)
        if (factory) this.addStore(store, factory.store)
        return store
    },
    addStore: function (store: Partial<StorePropertiesOnly>, add: Partial<StorePropertiesOnly>) {
        let res: ResourceConstant
        for (res in add) store[res] = (store[res] ?? 0) + (add[res] ?? 0)
        return store
    },
    showAllRes() {

        let rooms: Room[] = _.values(Game.rooms)
        rooms = rooms.filter(e => e.controller?.my && (e.storage || e.terminal))
        const roomResAll: { [room: string]: Partial<StorePropertiesOnly> } = {}
        for (const room of rooms) {
            roomResAll[room.name] = this.getStorageTerminalRes(room)
        }
        const all: Partial<StorePropertiesOnly> = {}
        for (const room_name in roomResAll) {
            this.addStore(all, roomResAll[room_name])
        }

        // StrategyMarket.showAllRes()
        const time = Game.cpu.getUsed()
        const base: ResourceConstant[] = [RESOURCE_ENERGY, "U", "L", "K", "Z", "X", "O", "H", RESOURCE_POWER, RESOURCE_OPS]
        // 压缩列表
        const bars = [RESOURCE_BATTERY, RESOURCE_UTRIUM_BAR, RESOURCE_LEMERGIUM_BAR, RESOURCE_KEANIUM_BAR, RESOURCE_ZYNTHIUM_BAR, RESOURCE_PURIFIER, RESOURCE_OXIDANT, RESOURCE_REDUCTANT, RESOURCE_GHODIUM_MELT]
        // 商品
        const c_grey = [RESOURCE_COMPOSITE, RESOURCE_CRYSTAL, RESOURCE_LIQUID]
        const c_blue = [RESOURCE_DEVICE, RESOURCE_CIRCUIT, RESOURCE_MICROCHIP, RESOURCE_TRANSISTOR, RESOURCE_SWITCH, RESOURCE_WIRE, RESOURCE_SILICON].reverse()
        const c_yellow = [RESOURCE_MACHINE, RESOURCE_HYDRAULICS, RESOURCE_FRAME, RESOURCE_FIXTURES, RESOURCE_TUBE, RESOURCE_ALLOY, RESOURCE_METAL].reverse()
        const c_pink = [RESOURCE_ESSENCE, RESOURCE_EMANATION, RESOURCE_SPIRIT, RESOURCE_EXTRACT, RESOURCE_CONCENTRATE, RESOURCE_CONDENSATE, RESOURCE_MIST].reverse()
        const c_green = [RESOURCE_ORGANISM, RESOURCE_ORGANOID, RESOURCE_MUSCLE, RESOURCE_TISSUE, RESOURCE_PHLEGM, RESOURCE_CELL, RESOURCE_BIOMASS].reverse()
        // boost
        const b_grey: ResourceConstant[] = ["OH", "ZK", "UL", "G"]

        const formatNumber = function (n: number): string {
            const b = n.toString();
            const len = b.length;
            if (len <= 3) return b;
            const r = len % 3;
            if (r > 0) return b.slice(0, r) + "," + b.slice(r, len).match(/\d{3}/g)?.join(",")
            else return '' + b.slice(r, len).match(/\d{3}/g)?.join(",");
        }
        let str = ""
        let colorMap: Partial<Record<ResourceConstant, string>> = {
            [RESOURCE_ENERGY]: "rgb(255,242,0)",
            "Z": "rgb(247, 212, 146)",
            "L": "rgb(108, 240, 169)",
            "U": "rgb(76, 167, 229)",
            "K": "rgb(218, 107, 245)",
            "X": "rgb(255, 192, 203)",
            "G": "rgb(255,255,255)",
            [RESOURCE_BATTERY]: "rgb(255,242,0)",
            [RESOURCE_ZYNTHIUM_BAR]: "rgb(247, 212, 146)",
            [RESOURCE_LEMERGIUM_BAR]: "rgb(108, 240, 169)",
            [RESOURCE_UTRIUM_BAR]: "rgb(76, 167, 229)",
            [RESOURCE_KEANIUM_BAR]: "rgb(218, 107, 245)",
            [RESOURCE_PURIFIER]: "rgb(255, 192, 203)",
            [RESOURCE_GHODIUM_MELT]: "rgb(255,255,255)",
            [RESOURCE_POWER]: "rgb(224,90,90)",
            [RESOURCE_OPS]: "rgb(224,90,90)",
        }
        let id = 0
        let addList = function (list: ResourceConstant[], color?: string) {
            let uniqueColor = function (str: string, resType: ResourceConstant) {
                if (colorMap[resType]) str = "<font style='color: " + colorMap[resType] + ";'>" + str + "</font>"
                return str
            }
            if (color) str += "<div style='color: " + color + ";'>"
            let left = 0
            let getAllRoom = function (text: string, resType: ResourceConstant) {
                let arr = []
                for (let roomName in roomResAll) {
                    arr.push(roomName.padStart(6) + ":" + formatNumber(roomResAll[roomName][resType] || 0).padStart(9))
                }
                id += 1
                left += 1
                return tips(text, arr, id, left)
            }
            list.forEach(e => str += getAllRoom(uniqueColor(e.padStart(15), e), e));
            str += "<br>";
            list.forEach(e => str += uniqueColor(formatNumber(all[e] || 0).padStart(15), e));
            str += "<br>";
            if (color) str += "</div>"
        }
        str += "<br>基础资源:<br>"
        addList(base)
        str += "<br>压缩资源:<br>"
        addList(bars)
        str += "<br>商品资源:<br>"
        addList(c_grey)
        addList(c_blue, "rgb(76, 167, 229)")
        addList(c_yellow, "rgb(247, 212, 146)")
        addList(c_pink, "rgb(218, 107, 245)")
        addList(c_green, "rgb(108, 240, 169)")
        str += "<br>LAB资源:<br>"
        addList(b_grey)
        addList(compound_color.U, "rgb(76, 167, 229)")
        addList(compound_color.Z, "rgb(247, 212, 146)")
        addList(compound_color.K, "rgb(218, 107, 245)")
        addList(compound_color.L, "rgb(108, 240, 169)")
        addList(compound_color.G, "rgb(255,255,255)")
        console.log(str)

        return "Game.cpu.used:" + (Game.cpu.getUsed() - time)
    },
}
_.assign(global, {HelperRoomResource: HelperRoomResource})

const compound_color: {
    [R in base]: MineralBoostConstant[]
} = {
    U: ["UH", "UH2O", "XUH2O", "UO", "UHO2", "XUHO2"],
    Z: ["ZH", "ZH2O", "XZH2O", "ZO", "ZHO2", "XZHO2"],
    K: ["KH", "KH2O", "XKH2O", "KO", "KHO2", "XKHO2"],
    L: ["LH", "LH2O", "XLH2O", "LO", "LHO2", "XLHO2"],
    G: ["GH", "GH2O", "XGH2O", "GO", "GHO2", "XGHO2"],
}