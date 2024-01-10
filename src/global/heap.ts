type _heap = string[]
export const FlagHeapUtils = {
    heapify(heap: _heap) {
        if (heap.length < 2) return;
        for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) {
            this.bubbleDown(heap, i);//bubbleDown操作
        }
    },

    peek(heap: _heap) {
        if (heap.length === 0) return null;
        return heap[0];//查看堆顶
    },

    push(heap: _heap, flag: Flag) {
        heap.push(flag.name);//加入数组
        this.bubbleUp(heap, heap.length - 1);//调整加入的元素在小顶堆中的位置
    },

    pop(heap: _heap) {
        if (heap.length === 0) return null;
        const result = heap[0];
        const last = heap.pop();
        if (heap.length !== 0 && last) {
            heap[0] = last;//交换第一个元素和最后一个元素
            this.bubbleDown(heap, 0);//bubbleDown操作
        }
        return result;
    },

    bubbleUp(heap: _heap, index: number) {
        while (index > 0) {
            const parentIndex = (index - 1) / 2;//父节点的位置
            //如果当前元素比父节点的元素小，就交换当前节点和父节点的位置
            if (this.comparator(heap[index], heap[parentIndex]) < 0) {
                this.swap(heap, index, parentIndex);//交换自己和父节点的位置
                index = parentIndex;//不断向上取父节点进行比较
            } else break;//如果当前元素比父节点的元素大，不需要处理
        }
    },

    bubbleDown(heap: _heap, index: number) {
        const lastIndex = heap.length - 1;//最后一个节点的位置
        while (true) {
            const leftIndex = index * 2 + 1;//左节点的位置
            const rightIndex = index * 2 + 2;//右节点的位置
            let findIndex = index;//bubbleDown节点的位置
            //找出左右节点中value小的节点
            //先和左子节点比较
            if (leftIndex <= lastIndex && this.comparator(heap[leftIndex], heap[findIndex]) < 0)
                findIndex = leftIndex;
            //再和右子结点比较
            if (rightIndex <= lastIndex && this.comparator(heap[rightIndex], heap[findIndex]) < 0)
                findIndex = rightIndex;
            if (index !== findIndex) {//说明需要被交换
                this.swap(heap, index, findIndex);//交换当前元素和左右节点中value小的
                index = findIndex;
            } else break;
        }
    },

    swap(heap: _heap, index1: number, index2: number) {//交换堆中两个元素的位置
        [heap[index1], heap[index2]] = [heap[index2], heap[index1]];
    },

    comparator(e1: string, e2: string) {
        return Memory.flags[e1]?._loop._time ?? 0
            - Memory.flags[e2]?._loop._time ?? 0;
    }
}
