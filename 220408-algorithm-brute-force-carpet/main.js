/*
x = 1, y = 1, r = 8

x = 2, y = 1, r = 10

x = 3, y = 1, r = 12

x = 4, y = 1, r = 14
x = 2, y = 2, r = 12

x = 5, y = 1, r = 16

x = 1 + n, y = 1 + m, r = 8 + 2n + 2m
...
x = 24, y = 1 r = 54
x = 1, y = 24, r = 54
x = 2, y = 12, r = 32
x = 3, y = 8, r = 26
x = 4, y = 6, r = 24


1 / 8
□□□
□■□
□□□
2 / 10
□□□□
□■■□
□□□□
2 / 10
□□□
□■□
□■□
□□□
3 / 12
□□□□□
□■■■□
□□□□□
6 / 14
□□□□□
□■■■□
□■■■□
□□□□□
4 / 14
□□□□□□
□■■■■□
□□□□□□
4 / 12
□□□□
□■■□
□■■□
□□□□
5 / 16
□□□□□□□
□■■■■■□
□□□□□□□ 
*/

// https://gist.github.com/lowfront/a31ea46ec9c3a4b3ac75bae16b3979e9
function* getDivisor(n) {
  let temp = 0;
  for (let i = 1; i <= n; i++) {
      if (n % i) continue;
      if (temp === i) break;
      temp = n / i;
      yield [i, temp];
  }
}

function solution(brown, yellow) {
  for (const [n, m] of getDivisor(yellow)) {
      if ((2 * (n - 1) + 2 * (m - 1) + 8) === brown) {
          return [n + 2, m + 2].sort((a, b) => b - a);
      }
  }
}