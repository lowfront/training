import Editor from "./Editor";
import { getChildNodes, getLastChildNode, isHTML, isText } from "./utils";

namespace Parser {
  export function firstWrap(input: HTMLElement) {
    if (input.firstChild) {
      if (!isHTML(input.firstChild, "p")) {
        const text = input.firstChild as Text;
        Editor.appendParagraph(input).append(text);
        Editor.focus(text, text.length);
      }
    }
  }

  export function lastWrap(input: HTMLElement) {
    // keyup
    if (Editor.hasOneEmptyParagraph(input)) {
      input.firstChild!.remove();
      Editor.focus(input, 0);
    }
  }

  export function isLast(input: HTMLElement, node: Node, offset: number) {
    if (input === node && getChildNodes(input).length - 1 === offset)
      return true;

    let targetNode = node;
    let isLast = isText(targetNode)
      ? targetNode.textContent!.length === offset
      : true;

    while (isLast && input !== targetNode) {
      isLast &&= getLastChildNode(targetNode.parentNode!) === targetNode;
      targetNode = targetNode.parentNode!;
    }

    return isLast;
  }
}

export default Parser;
