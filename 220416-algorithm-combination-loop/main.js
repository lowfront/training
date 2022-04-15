function* combination(array, n) {
  const result = [];

  for (let i = 0; i < array.length - n + 1; i++) {
      const stack = [[[array[i]], array.slice(i + 1)]];
      while (stack.length) {
          const [comb, rest] = stack.shift();
          if (comb.length === n) {
              yield comb;
              continue;
          }
          rest.forEach((item, i) => {
              if (!rest.length) return;
              const newRest = rest.slice(i + 1);
              stack.push([[...comb, item], newRest]);
          });
      }
  }
}
iter = combination([1, 2, 3, 4], 3);
[...iter]