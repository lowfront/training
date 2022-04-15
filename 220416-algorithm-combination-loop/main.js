function* combination(array, n) {
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
iter = combination([1, 2, 3, 4], 3);
[...iter];