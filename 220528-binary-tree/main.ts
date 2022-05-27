const getParent = (tree, i) => tree[Math.floor((i - 1) / 2)];
const getLeftChild = (tree, i) => tree[2 * i];
const getRightChild = (tree, i) => tree[2 * i + 1];
const getParentIndex = i => Math.floor((i - 1) / 2);
const getLeftChildIndex = i => 2 * i;
const getRightChildIndex = i => 2 * i + 1;

const binaryTree = [];

class BinaryTree extends Array {
  getParent(i: number) {
    return this[Math.floor((i - 1) / 2)];
  }
  getLeftChild(i: number) {
    return this[2 * i + 1];
  }
  getRightChild(i: number) {
    return this[2 * i + 1 + 1];
  }
  getParentIndex(i: number) {
    return Math.floor((i - 1) / 2);
  }
  getLeftChildIndex(i: number) {
    return 2 * i + 1;
  }
  getRightChildIndex(i: number) {
    return 2 * i + 1 + 1;
  }
  exchange(a: number, b: number) {
    const temp = this[a];
    this[a] = this[b];
    this[b] = temp;
  }
}

class MaxHeap extends BinaryTree {
  add(n: number) {
    const index = this.length;
    this[index] = n;
    this.sortUp(index);
    return this;
  }
  remove() {
    if (this.length <= 1) {
      this.splice(0);
      return this;
    }
    this[0] = this.splice(this.length - 1)[0];
    this.sortDown(0);
    return this;
  }
  sortUp(i: number) {
    const parentIndex = this.getParentIndex(i);
    if (parentIndex < 0) return;
    if (this[i] > this[parentIndex]) {
      this.exchange(i, parentIndex);
      this.sortUp(parentIndex);
    }
  }
  sortDown(i: number) {
    const leftChildIndex = this.getLeftChildIndex(i);
    const rightChildIndex = this.getRightChildIndex(i);
    const leftChild = this[leftChildIndex];
    const rightChild = this[rightChildIndex];

    if (leftChildIndex >= this.length) return;
    else if (rightChildIndex >= this.length && this[i] < leftChild) {
      this.exchange(i, leftChildIndex);
      this.sortDown(leftChildIndex);
    } else {
      const targetIndex = leftChild > rightChild ? leftChildIndex : rightChildIndex;
      const target = this[targetIndex];
      if (this[i] < target) {
        this.exchange(i, targetIndex);
        this.sortDown(targetIndex);
      }
    }
  }
}

class MinHeap extends BinaryTree {
  add(n: number) {
    const index = this.length;
    this[index] = n;
    this.sortUp(index);
  }
  remove() {
    if (this.length <= 1) {
      this.splice(0);
      return this;
    }
    this[0] = this.splice(this.length - 1)[0];
    this.sortDown(0);
    return this;
  }
  sortUp(i: number) {
    const parentIndex = this.getParentIndex(i);
    if (parentIndex < 0) return;
    if (this[i] < this[parentIndex]) {
      this.exchange(i, parentIndex);
      this.sortUp(parentIndex);
    }
  }
  sortDown(i: number) {
    const leftChildIndex = this.getLeftChildIndex(i);
    const rightChildIndex = this.getRightChildIndex(i);
    const leftChild = this[leftChildIndex];
    const rightChild = this[rightChildIndex];

    if (leftChildIndex >= this.length) return;
    else if (rightChildIndex >= this.length && this[i] > leftChild) {
      this.exchange(i, leftChildIndex);
      this.sortDown(leftChildIndex);
    } else {
      const targetIndex = leftChild < rightChild ? leftChildIndex : rightChildIndex;
      const target = this[targetIndex];
      if (this[i] > target) {
        this.exchange(i, targetIndex);
        this.sortDown(targetIndex);
      }
    }
  }
}

const maxHeap = new MaxHeap();
const minHeap = new MinHeap();


maxHeap.add(10);
maxHeap.add(9);
maxHeap.add(8);
maxHeap.add(7);
maxHeap.add(6);
maxHeap.add(5);
maxHeap.add(4);
maxHeap.add(3);
maxHeap.add(2);
maxHeap.add(1);

minHeap.add(10);
minHeap.add(9);
minHeap.add(8);
minHeap.add(7);
minHeap.add(6);
minHeap.add(5);
minHeap.add(4);
minHeap.add(3);
minHeap.add(2);
minHeap.add(1);

(window as any).maxHeap = maxHeap;
(window as any).minHeap = minHeap;