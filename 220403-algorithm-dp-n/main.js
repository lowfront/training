// f(1) => 1
// f(2) => 11
// f(3) => 111
const createN = n => Math.pow(10, n - 1) + (n > 1 ? createN(n - 1) : 0);
// or
// const createN = n => {
//   let r = 1;
//   for (let i = 1; i < n; i++) r += Math.pow(10, i);
//   return r;
// };
const K = 8;

function solution(N, R) {
  // K개의 Set을 만들고 N을 연결해서 만들 수 있는 자연수로 초기화
  const n = Array.from({length: K}, (_,i) => new Set([createN(i + 1) * N]));

  // R이 N을 연결해서 만들어진 수인지 먼저 확인
  for (let i = 0; i < n.length; i++) {
    if (n[i].has(R)) return i + 1;
  }

  // N이 i 개만큼 사용된 연산의 결과 확인
  for (let i = 0; i < n.length; i++) {
    // N이 i개 만큼 사용된 연산의 결과 그룹은 
    // N을 i개 연결해서 만들어진 수와,
    // N 1개 결과 그룹과 i-1개 결과 그룹의 연산
    // N 2개 결과 그룹과 i-2개 결과 그룹의 연산부터
    // N i-1개 결과 그룹과 1개 결과 그룹의 연산까지
    // 합집합으로 이루어짐
    // 예를들어, N이 2개 사용된 연산의 결과그룹은
    // NN과 N이 1개 사용된 결과 그룹과, N이 2-1개 사용된 결과 그룹의 연산
    // 결과 그룹으로 이루어짐
    for (let j = 0; j < i; j++) {
      for (const p1 of n[j]) {
        for (const p2 of n[i - j - 1]) {
          // 연산의 결과과 R과 같으면 바로 return;
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

  // 지정된 개수까지 결과를 찾지 못하면 return;
  return -1;
}

console.log(solution(2, 44));
console.log(solution(3, 79));