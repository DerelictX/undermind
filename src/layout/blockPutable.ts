import {exec, for4Direction, forBorder, forEach, forNear} from "@/layout/RoomArray";

/**
 * 计算区块的最大性能指标 ，性能消耗的大头！
 * 优化不动了
 */
export function getBlockPutAbleCnt(roomWalkable: CostMatrix, visited: CostMatrix, queMin: FlagHeapUtils<pos_node>,
                                   unionFind: UnionFind, tarRoot: number,
                                   putAbleCacheMap: Record<number, pos_node[]>, AllCacheMap: Record<number, pos_node[]>) {
    if (putAbleCacheMap[tarRoot]) return [putAbleCacheMap[tarRoot], AllCacheMap[tarRoot]]
    // let t = Game.cpu.getUsed() //这很吃性能，但是是必须的
    let roomManor = new PathFinder.CostMatrix
    forEach(roomManor, (x, y, val) => {
        if (tarRoot == unionFind.find(x * 50 + y)) {
            roomManor.set(x, y, 1)
        }
    })
    forEach(roomManor, (x, y, val) => {
        if (val) {
            let manorCnt = 0
            let wallCnt = 0
            for4Direction(roomManor, (x1, y1, val1) => {
                if (val1) manorCnt += 1
                if (!roomWalkable.get(x1, y1)) wallCnt += 1
            }, x, y)
            if (manorCnt == 1 && wallCnt == 0) roomManor.set(x, y, 0)
        }
    })
    let dfsMoreManor = function (x: number, y: number, val: number) {
        if (!val && roomWalkable.get(x, y)) {
            let manorCnt = 0
            let wallCnt = 0
            for4Direction(roomManor, (x1, y1, val1) => {
                if (val1) manorCnt += 1
                if (!roomWalkable.get(x1, y1)) wallCnt += 1
            }, x, y)
            if (manorCnt >= 2 || manorCnt == 1 && wallCnt >= 2) {
                roomManor.set(x, y, 1)
                for4Direction(roomManor, (x1, y1, val1) => {
                    dfsMoreManor(x1, y1, val1)
                }, x, y)
            }
        }
    }
    forEach(roomManor, (x, y, val) => {
        dfsMoreManor(x, y, val)
    })
    forBorder(roomWalkable, (x, y, val) => {
        if (val) {
            forNear(roomManor, (x, y, val) => {
                roomManor.set(x, y, 0)
            }, x, y)
            roomManor.set(x, y, 0)
        }
    })

    let innerPutAbleList: pos_node[] = []
    let AllCacheList: pos_node[] = []

    // &&!roomObjectCache.get(x,y)
    visited = new PathFinder.CostMatrix()

    forEach(roomWalkable, (x, y, val) => {
        if (!roomManor.get(x, y)) {
            queMin.push({w: (val ? -4 : -1), x, y});
            // visited.set(x,y,1) 这里不能设置visited 因为 -4 和-1 优先级不同 如果 -4距离和-1比较，-1会抢走-4 导致 rangeAttack打得到
        }
    })

    // let t = Game.cpu.getUsed() //这很吃性能，真的优化不动了
    queMin.whileNoEmpty(nd => {
        let func = function (x: number, y: number, val: number) {
            let item: pos_node = {w: nd.w + 2, x, y};
            if (!exec(visited, x, y, 1)) {
                queMin.push({w: nd.w + 1, x, y})
                if (roomManor.get(x, y)) {
                    if (nd.w + 1 >= 0 && val) {
                        innerPutAbleList.push(item)
                        // visual.text(nd.k+2, x,y+0.25, {color: 'red',opacity:0.99,font: 7})
                    }
                    if (val)
                        AllCacheList.push(item)
                }
            }
        }
        visited.set(nd.x, nd.y, 1)
        if (nd.w >= -1)
            for4Direction(roomWalkable, func, nd.x, nd.y)
        else
            forNear(roomWalkable, func, nd.x, nd.y)
    })

    // console.log(Game.cpu.getUsed()-t)

    putAbleCacheMap[tarRoot] = innerPutAbleList
    AllCacheMap[tarRoot] = AllCacheList
    return [putAbleCacheMap[tarRoot], AllCacheMap[tarRoot]]
}
