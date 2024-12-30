type pos_node = { w: number, x: number, y: number }

type LayoutPlanner = {
    unionFind: UnionFind
    sizeMap: Record<number, number>
    roomWalkable: CostMatrix
    nearWall: CostMatrix
    putAbleCacheMap: Record<number, pos_node[]>
    allCacheMap: Record<number, pos_node[]>
}