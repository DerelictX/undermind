import {exec, for4Direction, forBorder, forEach, forNear, initRoomTerrainWalkAble} from "@/layout/RoomArray";
import {getBlockPutAbleCnt} from "@/layout/blockPutable";

function computeNearWall(roomWalkable: CostMatrix) {
    const queMin = new FlagHeapUtils<pos_node>()
    let visited = new PathFinder.CostMatrix()
    //计算距离山体要多远
    forEach(roomWalkable, (x: number, y: number, val: number) => {
        if (!val) {
            queMin.push({w: 0, x, y});
            visited.set(x, y, 1)
        }
    })
    const nearWall = new PathFinder.CostMatrix()
    queMin.whileNoEmpty((nd) => {
        for4Direction(roomWalkable, (x, y, val) => {
            if (!exec(visited, x, y, 1) && val) {
                queMin.push({w: nd.w + 1, x, y});
            }
        }, nd.x, nd.y)
        nearWall.set(nd.x, nd.y, nd.w)
    })
    return nearWall
}

function execExit(roomWalkable: CostMatrix, nearWall: CostMatrix) {
    const queMin = new FlagHeapUtils<pos_node>()
    //距离出口一格不能放墙
    forBorder(roomWalkable, (x, y, val) => {
        if (val) {
            forNear(roomWalkable, (x, y, val) => {
                if (val) {
                    // roomWalkable.set(x,y,0);
                    nearWall.set(x, y, 50);
                    queMin.push({w: 0, x, y});
                    // visited.set(x,y,1)
                }
            }, x, y)
            // roomWalkable.set(x,y,0);
            queMin.push({w: 0, x, y});
            nearWall.set(x, y, 50)
            // visited.set(x,y,1)
        }
    })
    return queMin
}

function interpolateNearWall(roomWalkable: CostMatrix, nearWall: CostMatrix) {
    //插值，这里用拉普拉斯矩阵，对nearWall 插值 成 nearWallWithInterpolation
    const nearWallWithInterpolation = new PathFinder.CostMatrix()
    forEach(nearWall, (x, y, val) => {
        let value = -4 * val
        for4Direction(nearWall, (x, y, val) => {
            value += val
        }, x, y)
        //interpolation.set(x, y, value)
        if (value > 0) value = 0;
        if (val && roomWalkable.get(x, y)) {
            nearWallWithInterpolation.set(x, y, val + value * 0.1)
        }
    })
    return nearWallWithInterpolation
}

function computeRouteDistance(roomWalkable: CostMatrix, queMin: FlagHeapUtils<pos_node>) {
    // 计算距离出口多远
    let visited = new PathFinder.CostMatrix()
    const routeDistance = new PathFinder.CostMatrix()
    queMin.whileNoEmpty((nd) => {
        forNear(roomWalkable, (x, y, val) => {
            if (!exec(visited, x, y, 1) && val) {
                queMin.push({w: nd.w + 1, x, y});
            }
        }, nd.x, nd.y)
        routeDistance.set(nd.x, nd.y, nd.w)
    })
    // 对距离的格子插入到队列 ，作为分开的顺序
    const startPoint = new FlagHeapUtils<pos_node>()
    forEach(routeDistance, (x, y, val) => {
        if (!roomWalkable.get(x, y)) return
        if (val) startPoint.push({w: -val, x, y})
    })
    return startPoint
}

function makeBlock(startPoint: FlagHeapUtils<pos_node>, queMinBlock: FlagHeapUtils<pos_node & { v: number }>,
                   visited: CostMatrix, nearWallWithInterpolation: CostMatrix, unionFind: UnionFind,
                   sizeMap: Record<number, number>, posSeqMap: Record<number, number[]>) {
    let nd = startPoint.pop()
    if (!nd) return true
    let currentPos = nd.x * 50 + nd.y
    let cnt = 0
    let posSeq: number[] = []

    //搜索分块
    let dfsFindDown = function (roomArray: CostMatrix, x: number, y: number) {
        let currentValue = roomArray.get(x, y)
        if (!exec(visited, x, y, 1)) {
            for4Direction(roomArray, (x1, y1, val) => {
                if (val && (x1 == x || y1 == y) && val < currentValue) {
                    dfsFindDown(roomArray, x1, y1)
                }
            }, x, y)
            cnt++
            // visual.circle(x,y, {fill: color, radius: 0.5 ,opacity : 0.5})
            let pos = x * 50 + y
            posSeq.push(pos)
            unionFind.union(currentPos, pos)
        }
    }

    // 跑到最高点
    let dfsFindUp = function (roomArray: CostMatrix, x: number, y: number) {
        let currentValue = roomArray.get(x, y)
        if (!exec(visited, x, y, 1)) {
            forNear(roomArray, (x1, y1, val) => {
                if (val > currentValue && currentValue < 6) { //加了一点优化，小于时分裂更过
                    dfsFindUp(roomArray, x1, y1)
                } else if (val && val < currentValue) {
                    dfsFindDown(roomArray, x1, y1)
                }
            }, x, y)
            cnt++
            // visual.circle(x,y, {fill: color, radius: 0.5 ,opacity : 0.5})
            let pos = x * 50 + y
            posSeq.push(pos)
            unionFind.union(currentPos, pos)
        }
    }
    dfsFindUp(nearWallWithInterpolation, nd.x, nd.y)

    //记录每一块的位置和大小 以 并查集的根节点 作为记录点
    if (cnt > 0) {
        let pos = unionFind.find(currentPos);
        // queMin.push({k:cnt,v:pos})
        queMinBlock.push({w: cnt, x: 0, y: 0, v: pos})
        sizeMap[pos] = cnt
        posSeqMap[pos] = posSeq
    }
    return false
}

function deleteExitBlock(roomWalkable: CostMatrix, unionFind: UnionFind, sizeMap: Record<number, number>) {
    // 将出口附近的块删掉
    forBorder(roomWalkable, (x, y, val) => {
        if (val) {
            forNear(roomWalkable, (x, y, val) => {
                if (val) {
                    let pos = unionFind.find(x * 50 + y);
                    if (sizeMap[pos]) delete sizeMap[pos]
                }
            }, x, y)
            let pos = unionFind.find(x * 50 + y);
            if (sizeMap[pos]) delete sizeMap[pos]
        }
    })
}


/**
 * 插值，计算区块的预处理和合并需求
 * @param roomName
 */
function computeBlock(roomName: string) {
    const roomWalkable = new PathFinder.CostMatrix();
    initRoomTerrainWalkAble(roomWalkable, roomName)
    const nearWall = computeNearWall(roomWalkable)
    const roomExits = execExit(roomWalkable, nearWall)
    const nearWallWithInterpolation = interpolateNearWall(roomWalkable, nearWall)
    const startPoint = computeRouteDistance(roomWalkable, roomExits)

    let sizeMap: Record<number, number> = {}
    let posSeqMap: Record<number, number[]> = {}

    // 分块，将地图分成一小块一小块
    const unionFind = new UnionFind(50 * 50)
    let visited = new PathFinder.CostMatrix()
    const queMinBlock = new FlagHeapUtils<pos_node & { v: number }>()
    for (let i = 0; i < 3000; i++) {
        if (makeBlock(startPoint, queMinBlock, visited, nearWallWithInterpolation, unionFind, sizeMap, posSeqMap))
            break
    }
    deleteExitBlock(roomWalkable, unionFind, sizeMap)

    let putAbleCacheMap: Record<number, pos_node[]> = {}
    let allCacheMap: Record<number, pos_node[]> = {}
    // let i = 0
    // 合并小块成大块的
    const queMin2 = new FlagHeapUtils<pos_node>()
    queMinBlock.whileNoEmpty(nd => {
        let pos = nd.v;
        if (nd.w != sizeMap[pos]) return;// 已经被合并了
        // i++;

        visited = new PathFinder.CostMatrix()
        let nearCntMap: Record<number, number> = {}
        let allNearCnt = 0

        //搜索附近的块
        posSeqMap[pos].forEach(e => {
            let y = e % 50;
            let x = Math.round((e - y) / 50);//Math.round
            forNear(roomWalkable, (x, y, val) => {
                if (val && !exec(visited, x, y, 1)) {
                    let currentPos = unionFind.find(x * 50 + y);
                    if (currentPos == pos) return;
                    allNearCnt += 1
                    // if(i==104)
                    // visual.text(parseInt(1*10)/10, x,y+0.25, {color: "cyan",opacity:0.99,font: 7})
                    let currentSize = sizeMap[currentPos];
                    if (currentSize < 300) {
                        nearCntMap[currentPos] = (nearCntMap[currentPos] || 0) + 1;
                    }
                }
            }, x, y)
        })

        let targetPos = 0;
        let nearCnt = 0;
        let maxRatio = 0;

        // 找出合并附近最优的块
        for (let currentPos in nearCntMap) {
            let currentRatio = nearCntMap[currentPos] / Math.sqrt(Math.min(sizeMap[currentPos], nd.w))//实际/期望
            if (currentRatio == maxRatio ? sizeMap[currentPos] < sizeMap[targetPos] : currentRatio > maxRatio) {
                targetPos = Number(currentPos);
                maxRatio = currentRatio;
                nearCnt = nearCntMap[currentPos];
            }
        }
        for (let currentPos in nearCntMap) {
            if (nearCnt < nearCntMap[currentPos]) {
                targetPos = Number(currentPos);
                nearCnt = nearCntMap[currentPos];
            }
        }

        let minSize = sizeMap[targetPos];
        let cnt = nd.w + minSize;
        // let nearRatio =nearCntMap[targetPos]/allNearCnt;

        const minPlaneCnt = 140
        let targetBlockPutAbleCnt = 0
        let ndkBlockPutAbleCnt = 0
        if (minSize > minPlaneCnt)
            targetBlockPutAbleCnt = getBlockPutAbleCnt(roomWalkable, visited, queMin2, unionFind, targetPos, putAbleCacheMap, allCacheMap)[0].length
        if (nd.w > minPlaneCnt)
            ndkBlockPutAbleCnt = getBlockPutAbleCnt(roomWalkable, visited, queMin2, unionFind, nd.v, putAbleCacheMap, allCacheMap)[0].length

        // 合并
        if (targetPos && Math.max(targetBlockPutAbleCnt, ndkBlockPutAbleCnt) < minPlaneCnt) {//&&(maxRatio-Math.sqrt(cnt)/20>=0||(nearRatio>0.7&&nd.k<100))
            // if(targetPos&&(cnt<300||Math.min(nd.k,minSize)<150)&&(maxRatio-Math.sqrt(cnt)/20>=0||Math.max(nd.k,minSize)<200||(nearRatio>0.7&&nd.k<100))){//*Math.sqrt(nearRatio)

            unionFind.union(pos, targetPos);
            nd.v = unionFind.find(pos);

            if (pos != nd.v) delete sizeMap[pos];
            else delete sizeMap[targetPos];

            nd.w = cnt;
            sizeMap[nd.v] = cnt;
            posSeqMap[nd.v] = posSeqMap[targetPos].concat(posSeqMap[pos])
            delete putAbleCacheMap[nd.v]
            delete putAbleCacheMap[targetPos]
            if (pos != nd.v) delete posSeqMap[pos];
            else delete posSeqMap[targetPos];
            queMinBlock.push({w: nd.w, x: nd.x, y: nd.y, v: nd.v});
        }
    })
    global.layout = {
        unionFind: unionFind, sizeMap: sizeMap, roomWalkable: roomWalkable,
        nearWall: nearWall, putAbleCacheMap: putAbleCacheMap, allCacheMap: allCacheMap
    }
}