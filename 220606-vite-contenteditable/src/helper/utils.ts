
export type DFSNext<T> = (target: T, stack: T[]) => (T[]|void);

export function* dfs<T>(root: T) {
  const stack: T[] = [root];
  let target: T|undefined;
  
  while (target = stack.shift()) stack.unshift(...((yield target) as DFSNext<T>)?.(target, stack) ?? []);
}

export function* createDFSIterable<T>(root: T, next: DFSNext<T>) {
  const iteratble = dfs(root);
  let value: T|void;
  let done: boolean|undefined;
  while (({value, done} = iteratble.next(next)), !done) yield value as T;
}

export function debounce<T extends any[]>(f: (...args: T) => void, ms: number) {
  let timer: number|undefined;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(f, ms, ...args);
  };
}