export function isHTML<K extends keyof HTMLElementTagNameMap>(
  node: Node | null,
  tagName: K
): node is HTMLElementTagNameMap[K] {
  return (
    node?.nodeType === 1 &&
    (node as HTMLElement).tagName === tagName.toUpperCase()
  );
}

export function isText(node: Node): node is Text {
  return node.nodeType === 3;
}

export function createPromise<T>() {
  let resolve: (value: T) => void;
  return [new Promise<T>((res) => (resolve = res)), resolve!];
}
