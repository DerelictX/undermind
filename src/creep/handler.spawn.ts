import { structure_updater } from "@/room/structure.updater"
import { static_updater } from "@/scanner/static"
import { change_reaction } from "@/structure/lab"
import _ from "lodash"
import { init_carrier_behavior, init_worker_behavior } from "./config.behavior"

type RoleImpl = Omit<SpawnTask,'_caller'>
const spawn_handler: {[r in AnyRole]:(room:Room,looper:Looper) => RoleImpl|null} = {
    HarvesterSource0: function (room: Room) {
        static_updater['sources'](room)
        if (!room.memory._typed._static.H_srcs?.[0]) return null
        if (!room.memory._typed._static.T_src0[0]) {
            const posed = room.memory._typed._static.H_srcs[0]
            const main: CallbackBehavior<TargetedAction> = {...{bhvr_name:'callbackful'},...posed}
            const move: CallbackBehavior<'approach'> = {...{bhvr_name:'callbackful'},
                    ...{action:"approach",args:[posed.pos,1]}}
            main[ERR_NOT_FOUND] = move
            main[ERR_NOT_IN_RANGE] = move
            return {
                _body:{generator:'W',workload:5},
                _class:{...{bhvr_name:'callbackful'},...main}
            }
        }
        return {
            _body:{generator:'Wc',workload:15},
            _class:init_worker_behavior('HarvesterSource0',room.name,room.name)
        }
    },
    HarvesterSource1: function (room: Room) {
        static_updater['sources'](room)
        if (!room.memory._typed._static.H_srcs?.[1]) return null
        if (!room.memory._typed._static.T_src1[0]) {
            const posed = room.memory._typed._static.H_srcs[1]
            const main: CallbackBehavior<TargetedAction> = {...{bhvr_name:'callbackful'},...posed}
            const move: CallbackBehavior<'approach'> = {...{bhvr_name:'callbackful'},
                    ...{action:"approach",args:[posed.pos,1]}}
            main[ERR_NOT_FOUND] = move
            main[ERR_NOT_IN_RANGE] = move
            return {
                _body:{generator:'W',workload:5},
                _class:{...{bhvr_name:'callbackful'},...main}
            }
        }
        return {
            _body:{generator:'Wc',workload:15},
            _class:init_worker_behavior('HarvesterSource1',room.name,room.name)
        }
    },
    HarvesterSource2: function (room: Room) {
        static_updater['sources'](room)
        const controller = room.controller
        if(controller){
            const reservation = controller.reservation
            if(reservation && reservation.username == 'absGeist' && reservation.ticksToEnd > 3000){
                return null
            }
            const posed: Posed<PrimitiveDescript<'reserveController'>> = {
                action: 'reserveController',
                args: [controller.id],
                pos: controller.pos
            }
            const main: CallbackBehavior<TargetedAction> = {...{bhvr_name:'callbackful'},...posed}
            const move: CallbackBehavior<'approach'> = {...{bhvr_name:'callbackful'},
                    ...{action:"approach",args:[posed.pos,1]}}
            main[ERR_NOT_FOUND] = move
            main[ERR_NOT_IN_RANGE] = move
            return {
                _body:{generator:'Cl',workload:4},
                _class:{...{bhvr_name:'callbackful'},...main}
            }
        }

        if (!room.memory._typed._static.H_srcs?.[2]) return null
        if (!room.memory._typed._static.T_src2?.[0]) {
            const posed = room.memory._typed._static.H_srcs[2]
            const main: CallbackBehavior<TargetedAction> = {...{bhvr_name:'callbackful'},...posed}
            const move: CallbackBehavior<'approach'> = {...{bhvr_name:'callbackful'},
                    ...{action:"approach",args:[posed.pos,1]}}
            main[ERR_NOT_FOUND] = move
            main[ERR_NOT_IN_RANGE] = move
            return {
                _body:{generator:'W',workload:5},
                _class:{...{bhvr_name:'callbackful'},...main}
            }
        }
        return {
            _body:{generator:'Wc',workload:10},
            _class:init_worker_behavior('HarvesterSource2',room.name,room.name)
        }
    },
    HarvesterMineral: function (room: Room) {
        if(room.memory._typed._type != 'owned') return null
        static_updater['mineral'](room)
        const posed = room.memory._typed._static.H_mnrl[0]
        const stand = room.memory._typed._static.T_mnrl[0]
        if(!posed || !stand) return null
        const mineral = Game.getObjectById(posed.args[0])
        const storage = room.storage
        if (!mineral || !storage) return null
        if (storage.store[mineral.mineralType] > 60000) return null

        const main: CallbackBehavior<'harvest'> = {...{bhvr_name:'callbackful'},...posed}
        const move: CallbackBehavior<'approach'> = {...{bhvr_name:'callbackful'},
                ...{action:"approach",args:[stand.pos,0]}}
        move[OK] = main
        return {
            _body:{generator:'W',workload:24},
            _class:{...{bhvr_name:'callbackful'},...move}
        }
    },
    Upgrader: function (room: Room, looper: Looper) {
        if(room.memory._typed._type != 'owned') return null
        static_updater['controller'](room)
        if (!room.memory._typed._static.W_ctrl[0]) return null
        if (room.controller?.level == 8) return null
        if(room.storage && room.storage.store.energy <= 150000) return null

        looper.interval = 900
        return {
            _body:{generator:'Wc',workload:30},
            _class:init_worker_behavior('Upgrader',room.name,room.name)
        }
    },

    HarvesterDeposit: function (room: Room) {
        if(room.memory._typed._type != 'highway') return null
        const deposit = room.find(FIND_DEPOSITS,{
            filter: (deposit) => deposit.cooldown < 80
        })[0]
        const storage = Game.rooms[room.memory._spawn]?.storage
        if(!deposit || !storage) return null

        const main: CallbackBehavior<'harvest'> = {
            bhvr_name:'callbackful',action:'harvest',args:[deposit.id]}
        main[ERR_NOT_IN_RANGE] = main[ERR_NOT_FOUND] = {
            bhvr_name:'callbackful',action:'approach',args:[deposit.pos,1]}
        const back: CallbackBehavior<'transfer'> = {
            bhvr_name:'callbackful',action:'transfer',args:[storage.id,deposit.depositType]}
        back[ERR_NOT_IN_RANGE] = {
            bhvr_name:'callbackful',action:'approach',args:[storage.pos,1]}
            
        const full_store: CallbackBehavior<'prejudge_full'> = {
            bhvr_name:'callbackful',action:"prejudge_full",args:[0]}
        full_store[OK] = main
        full_store[ERR_FULL] = back
        return {
            _body:{generator:'DH',workload:25,mobility:1},
            _class: full_store
        }
    },
    Builder: function (room: Room, looper: Looper) {
        const storage = room.storage
        if(!storage){
            if(!room.find(FIND_MY_CONSTRUCTION_SITES).length) return null
            looper.interval = 1500
            return {
                _body:{generator:'WC',workload:12},
                _class:init_worker_behavior('Builder',room.name,room.name)
            }
        } else {
            looper.interval = 900
            if(storage.store.energy <= 180000) return null
            return {
                _body:{generator:'WC',workload:32},
                _class:init_worker_behavior('Builder',room.name,room.name)
            }
        }
    },
    Maintainer: function (room: Room) {
        const decayed = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType == STRUCTURE_ROAD
                    ||structure.structureType == STRUCTURE_CONTAINER)
                    return structure.hits < structure.hitsMax * 0.5
                return false
            }
        })
        if(!decayed.length) return null
        return {
            _body:{generator:'WC',workload:8},
            _class:init_worker_behavior('Maintainer',room.name,room.name)
        }
    },
    EnergySupplier: function (room: Room) {
        return null
        return {
            _body:{generator:'C',workload:8},
            _class:init_worker_behavior('EnergySupplier',room.name,room.name)
        }
    },

    Collector: function (room: Room, looper: Looper) {
        static_updater.containers(room)
        let _spawn = room.memory._spawn
        if(room.memory._typed._type == 'reserved') {
            looper.interval = 750
            return {
                _body:{generator:'C',workload:32},
                _class:init_carrier_behavior('Collector',room.name,_spawn)
            }
        }

        if(!room.storage?.my) return null
        return {
            _body:{generator:'C',workload:16},
            _class:init_carrier_behavior('Collector',room.name,room.name)
        }
    },
    Supplier: function (room: Room) {
        if(room.memory._typed._type != 'owned') return null
        structure_updater.towers(room,room.memory._typed._struct)
        structure_updater.links(room,room.memory._typed._struct)
        structure_updater.unique(room,room.memory._typed._struct)
        if(!room.storage?.my) return null
        return {
            _body:{generator:'C',workload:16},
            _class:init_carrier_behavior('Supplier',room.name,room.name)
        }
    },
    Chemist: function (room: Room, looper: Looper) {
        if(room.memory._typed._type != 'owned') return null
        structure_updater.labs(room,room.memory._typed._struct)
        change_reaction(room)
        looper.interval = 300
        return null
    },
}

/**
 * 定时任务调度程序，用于扫描房间和孵化
 * @param room 
 * @returns 
 */
export const spawn_loop = function(room: Room) {
    let role_name: keyof typeof room.memory._typed._looper
    for(role_name in room.memory._typed._looper){
        const spawn_loop = room.memory._typed._looper[role_name]
        if(!spawn_loop || spawn_loop.reload_time > Game.time)
            continue
        
        /**调用扫描程序 */
        const role_impl = spawn_handler[role_name](room,spawn_loop)
        /**限定时间间隔，防止无限生爬 */
        if(spawn_loop.interval < 200) spawn_loop.interval = 200
        if(spawn_loop.interval > 10000) spawn_loop.interval = 10000
        /**重置定时器 */
        spawn_loop.reload_time = Game.time + spawn_loop.interval

        if(role_impl){
            let _spawn
            if(room.memory._typed._type == 'owned'){
                _spawn = room.memory._typed._struct.spawns.t1
            } else {
                /**援助爬孵化优先级更低 */
                _spawn = Memory.rooms[room.memory._spawn]._typed._struct?.spawns.t2
                if(!_spawn) return
            }
            /**按获取到的role_impl生爬 */
            const caller = {_caller:{room_name:room.name,looper:role_name}}
            _spawn.push({...caller,...role_impl})
        }
        /**每tick只扫描一次，减少cpu负载波动 */
        return
    }
}