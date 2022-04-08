function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i < n; i++) if (!(n % i)) return false;
  return true;
}

// https://gist.github.com/lowfront/da605ac5190b9933b407b8bdf7376268
function* numberOfCases(...args) {
  const stack = [['', args]];
  while (stack.length) {
      const target = stack.shift();
      if (target) {
          const [result, rest] = target;
          for (let i = 0; i < rest.length; i++) {
              let r;
              yield r = result + rest[i];
              stack.push([r, rest.filter((_, index) => index !== i)]);
          }
      }
  }
}

function solution(numbers) {
  const r = {};
  let count = 0;
  for (const n of numberOfCases(...numbers.split(''))) {
      if (r[Number(n)]) continue;
      r[Number(n)] = true;
      isPrime(Number(n)) && count++;
  }
  return count;
}