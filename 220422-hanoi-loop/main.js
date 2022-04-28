const PLAN_TYPE = Symbol('plan');
const MOVE_TYPE = Symbol('move');

const pillarMap = {
  1: 2, // 0 + 1
  3: 0, // 1 + 2
  2: 1, // 2 + 0
};

function getWaypoint(start, end) {
  return pillarMap[start + end];
}

function* hanoi(plateLength, start, end) {
  if (start === end) return;
  const stack = [[PLAN_TYPE, plateLength, start, end]];
  let target;
  while (target = stack.shift()) {
    const [type, no, start, end] = target;
    const waypoint = getWaypoint(start, end);
    switch (type) {
    case PLAN_TYPE:
      if (no === 1) stack.unshift([MOVE_TYPE, no, start, end]);
      else stack.unshift(
        [PLAN_TYPE, no - 1, start, waypoint],
        [MOVE_TYPE, no, start, end],
        [PLAN_TYPE, no - 1, waypoint, end],
      );
      break;
    case MOVE_TYPE:
      yield [no, start, end];
      break;
    default:
      throw new Error('Never Appear');
    }
  }
}
for (const [no, start, end] of hanoi(5, 0, 1)) console.log(`${no}번 원판을 ${start + 1}번 기둥에서 ${end + 1}번 기둥으로 이동`);

/*
필요한 공간 : 현재 위치, 경유 위치, 목표 위치
4 : 0 -> 1 // 완성되어있는 탑 기준으로 시작, n : a -> b = n번 원판을 a에서 b로 옮길 예정, n -> a = n번 원판을 a로 이동
  3 : 0 -> 2
    2 : 0 -> 1
      1 : 0 -> 2
        1 -> 2
      2 -> 1
      1 : 2 -> 1
        1 -> 1
    3 -> 2
    2 : 1 -> 2
      1 : 1 -> 0
        1 -> 0
      2 -> 2
      1 : 0 -> 2
        1 -> 2
  4 -> 1
  3 : 2 -> 1
    2 : 2 -> 0
      1 : 2 -> 1
        1 -> 1
      2 -> 0
      1 : 1 -> 0
        1 -> 0
    3 -> 1
    2 : 0 -> 1
      1 : 0 -> 2
        1 -> 2
      2 -> 1
      1 : 2 -> 1
        1 -> 1
...
*/