class UnionFind {
    size: number = 0
    parent: number[] = []

    constructor(size: number) {
        this.size = size
        this.parent = new Array(this.size)
        for (let i = 0; i < this.size; i++) {
            this.parent[i] = i;
        }
    }

    find(x: number) {
        let r = x;
        while (this.parent[r] != r) r = this.parent[r];
        while (this.parent[x] != x) {
            let t = this.parent[x];
            this.parent[x] = r;
            x = t;
        }
        return x;
    }

    union(a: number, b: number) {
        a = this.find(a)
        b = this.find(b)
        if (a > b) this.parent[a] = b;
        else if (a != b) this.parent[b] = a;
    }

    same(a: number, b: number) {
        return this.find(a) == this.find(b)
    }
}