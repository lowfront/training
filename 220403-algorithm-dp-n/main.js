// f(1) => 1
// f(2) => 11
// f(3) => 111
const createN = n => Math.pow(10, n - 1) + (n > 1 ? createN(n - 1) : 0);
const K = 8;

function solution(N, R) {
  // K개의 Set을 만들고 N을 연결해서 만들 수 있는 자연수로 초기화
  const n = Array.from({length: K}, (_,i) => new Set([createN(i + 1) * N]));

  for (let i = 0; i < n.length; i++) {
    if (n[i].has(R)) return i + 1;
  }
  for (let i = 0; i < n.length; i++) {
    for (let j = 0; j < i; j++) {
      for (const p1 of n[j]) {
        for (const p2 of n[i - j - 1]) {
          let val;
          if ((val = p1 + p2) === R) return i + 1;
          n[i].add(val);
          if ((val = p1 - p2) === R) return i + 1;
          n[i].add(val);
          if ((val = p1 * p2) === R) return i + 1;
          n[i].add(val);
          if (p2 !== 0) {
            if ((val = p1 / p2) === R) return i + 1;
            n[i].add(val);
          }
        }
      }
    }
  }
  return -1;
}

console.log(solution(2, 44));
console.log(solution(3, 79));