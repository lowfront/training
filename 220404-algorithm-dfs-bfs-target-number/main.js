/*
// BFS 풀이
function solution(numbers, target) {
  const list =  Array.from({length: numbers.length}, () => []);
  list[0].push(numbers[0], -numbers[0])
  
  for (let i = 1; i < numbers.length; i++) {
      list[i - 1].forEach(n => {
          list[i].push(n + numbers[i], n - numbers[i]);
      });
  }
  
  return list[list.length - 1].filter(n => n === target).length;
}

solution([4,1,2,1], 4);
*/

// DFS 풀이 추가 예정