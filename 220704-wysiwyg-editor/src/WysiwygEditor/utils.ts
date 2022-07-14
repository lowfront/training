export function isHTML<K extends keyof HTMLElementTagNameMap>(
  node: Node | null,
  tagName: K
): node is HTMLElementTagNameMap[K] {
  return (
    node?.nodeType === 1 &&
    (node as HTMLElement).tagName === tagName.toUpperCase()
  );
}

export function isText(node: any): node is Text {
  return node?.nodeType === 3;
}

export function getChildNodes(input: HTMLElement | Node) {
  return [...input.childNodes];
}

export function getLastChildNode(node: Node) {
  const childNodes = [...node.childNodes];
  return childNodes[childNodes.length - 1];
}

export function createPromise<T>() {
  let resolve: (value: T) => void;
  return [new Promise<T>((res) => (resolve = res)), resolve!];
}

export function insertAfter(node: Node, child: Node, parent: Node = child.parentNode!) {
  if (child.nextSibling) {
    parent.insertBefore(node, child.nextSibling);
  } else {
    parent.appendChild(node);
  }
}