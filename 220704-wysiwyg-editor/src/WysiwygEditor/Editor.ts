import { getChildNodes, isHTML } from "./utils";

namespace Editor {
  export function getSelection() {
    return window.getSelection();
  }

  export function focus(node: Node, offset: number) {
    const selection = getSelection()!;
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  export function appendParagraph(
    input: HTMLElement,
    textContent?: string,
    insertIndex?: number
  ) {
    const p = document.createElement("p");
    textContent && (p.textContent = textContent);

    if (insertIndex === undefined) {
      input.append(p);
    } else {
      input.insertBefore(p, getChildNodes(input)[insertIndex]);
    }
    return p;
  }

  export function hasOneEmptyParagraph(input: HTMLElement) {
    return !input.firstChild?.nextSibling && !input.firstChild!.textContent;
  }
  export function indexOf(input: HTMLElement, node: Node) {
    return getChildNodes(input).indexOf(node as ChildNode);
  }
}

export default Editor;
