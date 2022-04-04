function changeable(a, b) {
  let count = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) count++;
  }
  return count === 1;
}

function solution(begin, target, words) {
    if (!words.includes(target)) return 0;
    const stack = [[begin]];
    let count = 0;
    while (stack.length) {
        count++;
        const current = stack.shift();
        const next = [];
        for (const currentWord of current) for (const word of words) {
            if (changeable(word, currentWord)) {
                if (word === target) return count;
                next.push(word);
            }
        }
        stack.push(next);
    }
    return count;
}
