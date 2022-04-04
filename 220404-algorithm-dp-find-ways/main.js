const M = 4;
const N = 3;
const puddles = [[2, 2]];
const list = Array.from({length: N}, () => Array.from({length: M}, () => 0));
list[0][0] = 1;
for (let y = 0; y < N; y++) for (let x = 0; x < M; x++) {
  if (x + y === 0) continue;
  else if (puddles.some(([a, b]) => a - 1 === x && b - 1 === y)) continue;
  else {
    list[y][x] = (list[y - 1]?.[x] ?? 0) + (list[y][x - 1] ?? 0);
  }
}
const result = list[N - 1][M - 1] % 1000000007;
console.log(result);