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
  const stack: number[][] = [...array].map(n => [n]);

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

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

(async () => {
  const bubbleSortIterable = bubbleSort(array);

  // for (const round of taskRunner(iterable, 1000)) {
  //   (document.getElementById('round') as HTMLElement).textContent = round + '';
  //   await sleep(0);
  // }
  // console.log(array)
  
  const mergeSortedArray = mergeSort(Array.from(Array(1000), () => Math.floor(Math.random() * 1000)));
  console.log(mergeSortedArray);
})();
