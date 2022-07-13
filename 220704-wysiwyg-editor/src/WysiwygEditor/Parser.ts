import Editor from "./Editor";
import { getChildNodes, getLastChildNode, isHTML, isText } from "./utils";

namespace Parser {
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

  export function isLastOfParagraph(
    input: HTMLElement,
    node: Node,
    offset: number
  ) {
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

  export function getCurrentParagraph(input: HTMLElement, node: Node) {
    let targetNode = node;
    while (!isHTML(targetNode, "p")) targetNode = targetNode.parentNode!;

    return targetNode;
  }
}

export default Parser;
