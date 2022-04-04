function solution(n, computers) {
  const r = Array.from({length: n}, () => false);
  let answer = 0;
  for (let i = 0; i < n; i++) {
      if (r[i]) continue;
      answer++;
      const stack = [i];
      let targetIndex;
      while (stack.length) {
          targetIndex = stack.shift();
          r[targetIndex] = true;
          const newIndexes = computers[targetIndex].reduce((acc, n, idx) => {
              if (idx !== i && n && !r[idx]) acc.push(idx);
              return acc;
          }, []);
          stack.push(...newIndexes);
      }
  }
  
  return answer;
}
solution(3, [[1, 1, 0], [1, 1, 1], [0, 1, 1]])