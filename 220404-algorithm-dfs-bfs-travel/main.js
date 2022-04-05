/*
function solution(tickets) {
  const result = [tickets[0][0]];
  const map = new Map();
  tickets.forEach(([a, b]) => {
      if (!map.has(a)) map.set(a, []);
      map.get(a).push(b);
  });
  [...map.values()].forEach(array => array.length > 1 && array.sort());
  let count = 0;
  let target = result[0];
  
  while (count < tickets.length) {
      count++;
      result.push(target = map.get(target).shift());
  }
  
  return result;
}
실패 코드
이유 확인안됨....
// init
const tickets = [['ICN', 'AAA'], ['ICN', 'BBB'], ['BBB', 'ICN']];
const visited = Array(tickets.length).fill(false);
const result = []

// add stack
target = ICN
stack = [['ICN', 'AAA'], ['ICN', 'BBB']]

// visit
target = ICN
currentTicket = ['ICN', 'AAA']
visited[0] = true
result = ['ICN']

// add stack
target = 'AAA'
stack = [['ICN', 'BBB']]

// visit n rollback
target = 'AAA'
currentTicket = null
result = ['ICN', 'AAA']
!currentTicket && stack.length -> rollback

// rollback
prevTicket = ['ICN', 'AAA']
result = ['ICN']
visited[0] = false
target = 'ICN'

// next stack
target = 'ICN'
stack = [['ICN', 'BBB']]

// visit
target = 'ICN'
currentTicket = ['ICN', 'BBB']
result = ['ICN']

// add stack
target = 'BBB'
stack = [['BBB', 'ICN']]

// visit
target = 'BBB'
currentTicket = ['BBB', 'ICN']
result = ['ICN', 'BBB']

// add stack
target = 'ICN'
stack = [['ICN', 'AAA']] <- visit = false

// visit
target = 'ICN'
currentTicket = ['ICN', 'AAA']
result = ['ICN', 'BBB', 'ICN']

// add stack
target = 'AAA'
stack = []

// visit n end
target = 'AAA'
currentTicket = null
result = ['ICN', 'BBB', 'ICN', 'AAA']
!currentTicket && !stack.length -> end
*/

// 1번 케이스 제외 통과...
/*
실패케이스
[["ICN", "AOO"], ["AOO", "BOO"], ["BOO", "COO"], ["COO", "DOO"], ["DOO", "EOO"], ["EOO", "DOO"], ["DOO", "COO"], ["COO", "BOO"], ["BOO", "AOO"]]
["ICN", "AOO", "BOO", "COO", "DOO", "EOO", "DOO", "COO", "BOO", "AOO"]

스택에 있는 위치와 맞을때까지 롤백 계속해야함
*/
function solution(tickets) {
  tickets.sort();
  const visited = [...tickets].fill(false);
  const stack = [];
  const result = ['ICN'];
  let target = 'ICN';
  let ticket;
  let back = false;
  let isNext = false;

  do {
    isNext = true;
    // console.log('target', target, back, result, stack);

    if (!back) {
      const nextStack = tickets.filter(([a, b], i) => !visited[i] && a === target);
      isNext = !!nextStack.length;
      stack.unshift(...nextStack);
    } else {
      if (stack[0][0] !== target) isNext = false;
    }
    
    if (isNext) {
      ticket = stack.shift();
      // console.log('next', ticket);
      const [, next] = ticket;
      const ticketIndex = tickets.findIndex(([a, b], i) => !visited[i] && ticket[0] === a && ticket[1] === b);
      visited[ticketIndex] = true;
      target = next;
      result.push(next);
      back = false;
    } else {
      // console.log('rollback', target);
      const prevTicket = result.slice(-2);
      const prevTicketIndex = tickets.findIndex(([a, b], i) => visited[i] && prevTicket[0] === a && prevTicket[1] === b);
      visited[prevTicketIndex] = false;
      result.pop();
      target = result[result.length - 1];
      back = true;
      
    }
  } while (result.length < tickets.length + 1)

  return result;
}

// console.log(solution([['ICN', 'AAA'], ['ICN', 'BBB'], ['BBB', 'ICN']]));
// console.log(solution([["ICN", "AOO"], ["AOO", "BOO"], ["BOO", "COO"], ["COO", "DOO"], ["DOO", "EOO"], ["EOO", "DOO"], ["DOO", "COO"], ["COO", "BOO"], ["BOO", "AOO"]]));