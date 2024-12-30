class FlagHeapUtils<T extends { w: number }> {
    arr: T[] = []

    constructor() {
        this.arr = []
    }

    heapify() {
        if (this.arr.length < 2) return;
        for (let i = Math.floor(this.arr.length / 2) - 1; i >= 0; i--) {
            this.bubbleDown(i);//bubbleDown操作
        }
    }

    peek() {
        if (this.arr.length === 0) return null;
        return this.arr[0];//查看堆顶
    }

    push(node: T) {
        this.arr.push(node);//加入数组
        this.bubbleUp(this.arr.length - 1);//调整加入的元素在小顶堆中的位置
    }

    pop() {
        if (this.arr.length === 0) return null;
        const result = this.arr[0];
        const last = this.arr.pop();
        if (this.arr.length !== 0 && last) {
            this.arr[0] = last;//交换第一个元素和最后一个元素
            this.bubbleDown(0);//bubbleDown操作
        }
        return result;
    }

    bubbleUp(index: number) {
        while (index > 0) {
            const parentIndex = (index - 1) / 2;//父节点的位置
            //如果当前元素比父节点的元素小，就交换当前节点和父节点的位置
            if (this.arr[index].w < this.arr[parentIndex].w) {
                this.swap(index, parentIndex);//交换自己和父节点的位置
                index = parentIndex;//不断向上取父节点进行比较
            } else break;//如果当前元素比父节点的元素大，不需要处理
        }
    }

    bubbleDown(index: number) {
        const lastIndex = this.arr.length - 1;//最后一个节点的位置
        while (true) {
            const leftIndex = index * 2 + 1;//左节点的位置
            const rightIndex = index * 2 + 2;//右节点的位置
            let findIndex = index;//bubbleDown节点的位置
            //找出左右节点中value小的节点
            //先和左子节点比较
            if (leftIndex <= lastIndex && this.arr[leftIndex].w < this.arr[findIndex].w)
                findIndex = leftIndex;
            //再和右子结点比较
            if (rightIndex <= lastIndex && this.arr[rightIndex].w < this.arr[findIndex].w)
                findIndex = rightIndex;
            if (index !== findIndex) {//说明需要被交换
                this.swap(index, findIndex);//交换当前元素和左右节点中value小的
                index = findIndex;
            } else break;
        }
    }

    swap(index1: number, index2: number) {//交换堆中两个元素的位置
        [this.arr[index1], this.arr[index2]] = [this.arr[index2], this.arr[index1]];
    }

    whileNoEmpty(func: (node: T) => void) {
        while (true) {
            let node = this.pop();
            if (!node) return
            func(node)
        }
    }
}
