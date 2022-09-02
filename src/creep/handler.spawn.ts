import { structure_updater } from "@/room/structure.updater"
import { static_updater } from "@/scanner/static"
import _ from "lodash"
import { init_carrier_behavior, init_worker_behavior } from "./config.behavior"

type RoleImpl = Omit<SpawnTask,'_caller'>
const spawn_handler: {[r in AnyRole]:(room:Room) => RoleImpl|null} = {
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
            _body:{generator:'Wc',workload:10},
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
            _body:{generator:'Wc',workload:10},
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
        if (!room.memory._typed._static.H_mnrl[0]) return null
        return null
    },
    Upgrader: function (room: Room) {
        if(room.memory._typed._type != 'owned') return null
        static_updater['controller'](room)
        if (!room.memory._typed._static.W_ctrl[0]) return null
        if (room.controller?.level == 8) return null
        if(room.storage && room.storage.store.energy <= 120000) return null
        return {
            _body:{generator:'Wc',workload:10},
            _class:init_worker_behavior('Upgrader',room.name,room.name)
        }
    },

    HarvesterDeposit: function (room: Room) {
        return null
    },
    Builder: function (room: Room) {
        const storage = room.storage
        if(!storage){
            if(!room.find(FIND_MY_CONSTRUCTION_SITES).length) return null
            return {
                _body:{generator:'WC',workload:12},
                _class:init_worker_behavior('Builder',room.name,room.name)
            }
        } else {
            if(storage.store.energy <= 180000) return null
            return {
                _body:{generator:'WC',workload:24},
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

    Collector: function (room: Room) {
        static_updater.containers(room)
        let _spawn = room.memory._typed._spawn
        if(_.isString(_spawn)) {
            return {
                _body:{generator:'C',workload:32},
                _class:init_carrier_behavior('Collector',room.name,_spawn)
            }
        }

        if(!room.storage?.my) return null
        return {
            _body:{generator:'C',workload:12},
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
            _body:{generator:'C',workload:12},
            _class:init_carrier_behavior('Supplier',room.name,room.name)
        }
    },
    Chemist: function (room: Room) {
        if(room.memory._typed._type != 'owned') return null
        structure_updater.labs(room,room.memory._typed._struct)
        return null
    },
}


export const spawn_loop = function(room: Room) {
    let _spawn = room.memory._typed._spawn
    if(_.isString(_spawn)) {
        if(!Memory.rooms[_spawn]) return
        _spawn = Memory.rooms[_spawn]._typed._spawn
        if(_.isString(_spawn)) return
    }
    if(!_spawn) return

    let role_name: keyof typeof room.memory._typed._looper
    for(role_name in room.memory._typed._looper){
        const spawn_loop = room.memory._typed._looper[role_name]
        if(!spawn_loop || spawn_loop.reload_time > Game.time)
            continue
        
        const role_impl = spawn_handler[role_name](room)
        if(!role_impl){
            spawn_loop.reload_time = Game.time + 400
            continue
        }

        spawn_loop.reload_time = Game.time + spawn_loop.interval
        const caller = {_caller:{room_name:room.name,looper:role_name}}
        _spawn.push({...caller,...role_impl})
        return
    }
}