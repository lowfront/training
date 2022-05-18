const array = new Uint32Array(100000);
for (let i = 0; i < array.length; i++)
  array[i] = Math.floor(Math.random() * array.length);

function* taskRunner(
  iterable: Generator<number, void, unknown>,
  count: number
) {
  for (const round of iterable) {
    if (!(round % count)) {
      (document.getElementById("round") as HTMLElement).textContent =
        round + "";
      yield round;
    }
  }
}

function* bubbleSort(array: Uint32Array) {
  let isSwap = false;
  let temp: number;
  const { length } = array;
  for (let i = 0; i < length - 1; i++) {
    isSwap = false;
    for (let j = 0; j < length - 1; j++) {
      if (array[j] > array[j + 1]) {
        temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
        isSwap = true;
      }
    }
    yield i;
    if (!isSwap) break;
  }
}

function mergeSort(array: number[]) {
  const stack: number[][] = [];

  for (let i = 0; i < array.length; i += 2) {
    if (array[i + 1] === undefined) {
      stack.push([array[i]]);
      break;
    }
    else if (array[i] < array[i + 1]) stack.push([array[i], array[i + 1]])
    else stack.push([array[i + 1], array[i]])
  }

  while (1) {
    const nextStackItem = [];
    const left = stack.shift();
    const right = stack.shift();
    
    let leftIndex = 0, rightIndex = 0;
    if (left.length === array.length) {
      return left;
    }

    while (leftIndex < left.length && rightIndex < right.length) {
      if (left[leftIndex] < right[rightIndex]) {
        nextStackItem.push(left[leftIndex]);
        leftIndex++;
      } else {
        nextStackItem.push(right[rightIndex]);
        rightIndex++;
      }
    }
    nextStackItem.push(...left.slice(leftIndex), ...right.slice(rightIndex));
    stack.push(nextStackItem);
  }
}


/*
[[5, 3, 8, 1, 2, 4, 9, 7, 6, 5, 3, 0]]
[[3, 1, 2, 4, 3, 0], 5, [8, 9, 7, 6, 5]]
[[1, 2, 0], 3, [4, 3], 5, [7, 6, 5], 8, [9]]
[[0], 1, [2], 3, [3], 4, 5, [5, 6], 7, 8, 9]
[0, 1, 2, 3, 3, 4, 5, 5, 6, 7, 8, 9]
*/
function quickSort(array: number[]) {
  const stack: (number[]|number)[][] = [[array]];
  let target: (number[]|number)[];
  let pivot: number;
  let noArray = true;
  while (target = stack.shift()) {
    noArray = true;
    const newStackItem: (number[]|number)[] = [];
    for (let i = 0; i < target.length; i++) {
      const item = target[i];
      if (!Array.isArray(item)) {
        newStackItem.push(item);
        continue;
      }

      pivot = item.shift(); // first pivot
      if (!item.length) {
        newStackItem.push(pivot);
        continue;
      }
      noArray = false;

      const left: number[] = [];
      const right: number[] = [];
      for (const n of item) {
        if (n < pivot) left.push(n);
        else right.push(n);
      }
      if (left.length) newStackItem.push(left);
      newStackItem.push(pivot);
      if (right.length) newStackItem.push(right);
    }
    if (noArray) return newStackItem;
    stack.push(newStackItem);
  }
}

function quickSortinPlace(array: number[]) {
  const stack: [number, number][] = [[0, array.length - 1]];
  let target: [number, number];
  let temp: number;
  while (target = stack.shift()) {
    const [firstIndex, lastIndex] = target;

    const middleIndex = Math.floor((firstIndex + lastIndex) / 2);

    const pivot = array[middleIndex];
    let leftIndex = firstIndex;
    let rightIndex = lastIndex;

    while (leftIndex <= rightIndex) {
      while (pivot > array[leftIndex]) leftIndex++;
      while (pivot < array[rightIndex]) rightIndex--;

      if (leftIndex >= rightIndex) break;
      temp = array[leftIndex];
      array[leftIndex] = array[rightIndex];
      array[rightIndex] = temp;
      leftIndex++;
      rightIndex--;
    }
    const nextMiddleIndex = leftIndex - 1;
    if (nextMiddleIndex - firstIndex > 1) stack.push([firstIndex, nextMiddleIndex]);
    if (lastIndex - leftIndex > 1) stack.push([leftIndex, lastIndex]);
  }
  return array;
}

function insertionSort(array: number[]) {
  let temp: number;
  for (let i = 1; i < array.length; i++) {
    temp = array[i];
    console.log('temp', array, i, temp);
    let leftIndex = i - 1;
    while (leftIndex >= 0 && temp < array[leftIndex]) {
      array[leftIndex + 1] = array[leftIndex];
      leftIndex--;
    }
    array[leftIndex + 1] = temp;
  }

  return array;
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

(async () => {
  // const bubbleSortIterable = bubbleSort(array);

  // for (const round of taskRunner(iterable, 1000)) {
  //   (document.getElementById('round') as HTMLElement).textContent = round + '';
  //   await sleep(0);
  // }
  // console.log(array)

  // const arr0 = Array.from(Array(100000), () => Math.floor(Math.random() * 100000));
  // console.time('merge sort');
  // const mergeSortedArray = mergeSort(arr0);
  // console.timeEnd('merge sort');
  // console.log('mergeSortedArray', mergeSortedArray);
  const arr0 = Array.from(Array(100000), () => Math.floor(Math.random() * 100000));
  console.time('native sort');
  arr0.sort();
  console.timeEnd('native sort');
  const arr1 = Array.from(Array(100000), () => Math.floor(Math.random() * 100000));
  console.time('quick sort');
  const quickSortedArray = quickSort(arr1);
  console.timeEnd('quick sort');
  const arr2 = Array.from(Array(100000), () => Math.floor(Math.random() * 100000));
  console.time('quick sort in place');
  const quickSortinPlaceArray = quickSortinPlace(arr2);
  console.timeEnd('quick sort in place');
  console.time('insertion sort');
  const arr3 = Array.from(Array(100000), () => Math.floor(Math.random() * 100000));
  console.timeEnd('insertion sort');
  // console.log('quickSortedArray', quickSortedArray);
  console.log('quickSortInPlaceArray', quickSortinPlaceArray);
})();
