// 경우의 수, 뽑기
function* numberOfCasesByCount(array, count) {
  const stack = [[[], array]];
  let target;
  while (target = stack.shift()) {
    const [c, rest] = target;
    if (c.length === count) yield c;
    else stack.push(...rest.map((item, i) => [[...c, item], rest.filter((_, j) => j !== i)]));
  }
}
// 모든 경우의 수
function* numberOfCases(array) {
  const { length } = array; 
  for (let i = 1; i <= length; i++) 
  for (const result of numberOfCasesByCount(array, i)) yield result;
}
// 조합, 뽑기
function* combination(array, n) {
  if (n === 1) {
    for (const item of array) yield [item];
    return;
  }

  for (let i = 0; i < array.length - n + 1; i++) {
    const stack = [[[array[i]], array.slice(i + 1)]];
    while (stack.length) {
      const [comb, rest] = stack.shift();
            
      for (let i = 0; i < rest.length; i++) {
        const newComb = [...comb, rest[i]];
        if (newComb.length === n) {
          yield newComb;
          continue;
        } else {
          const newRest = rest.slice(i + 1);
          stack.push([newComb, newRest]);
        }
      }
    }
  }
}
// 모든 조합
function* combinationAll(array) {
  const { length } = array; 
  for (let i = 1; i <= length; i++) 
  for (const result of combination(array, i)) yield result;
}

console.log('numberOfCasesByCount', ...numberOfCasesByCount([2,4,6,8,10], 3));
console.log('numberOfCases', ...numberOfCases([1,2,3]));
console.log('combination', ...combination([1, 2, 3, 4], 3));
console.log('combinationAll', ...combinationAll([1, 2, 3, 4]));
