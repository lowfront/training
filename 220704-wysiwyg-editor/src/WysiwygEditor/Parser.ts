import Editor from "./Editor";
import { isPreviousSiblingDeep, getChildNodes, getLastChildNode, isHTML, isText, isNextSiblingDeep } from "./utils";

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

  // FIXME: 가드 처리 위치 고민 필요
  function getTextNodesConnectedPrevious(parent: HTMLElement, cursorNode: Text) {
    if (cursorNode.data[0] === ' ') return [];
    if (isPreviousSiblingDeep(parent, cursorNode, node => isHTML(node, 'a'))) return [];

    const stack: Node[] = [cursorNode];
    const result = [];

    let target: Node;
    while (target = stack.shift()!) {
      if (isText(target)) {
        if (cursorNode !== target) {
          result.unshift(target);

          if (/\s/.test(target.data)) {
            break;
          }
        }

        if (target.previousSibling) {
          stack.push(target.previousSibling);
        } else {
          let parentNode = target.parentNode!;
          while (!parentNode.previousSibling && parent !== parentNode) parentNode = parentNode.parentNode!

          if (parentNode.previousSibling) stack.push(parentNode.previousSibling);
        }
      } else {
        if (target.lastChild) {
          stack.push(target.lastChild);
        }
      }
    }

    return result;
  }

  // FIXME: 가드 처리 위치 고민 필요
  function getTextNodesConnectedNext(parent: HTMLElement, cursorNode: Text) {
    if (cursorNode.data[cursorNode.data.length - 1] === ' ') return [];
    if (isNextSiblingDeep(parent, cursorNode, node => isHTML(node, 'a'))) return [];

    const stack: Node[] = [cursorNode];
    const result = [];

    let target: Node;
    while (target = stack.shift()!) {
      if (isText(target)) {
        if (cursorNode !== target) {
          result.unshift(target);

          if (/\s/.test(target.data)) {
            break;
          }
        }

        if (target.nextSibling) {
          stack.push(target.nextSibling);
        } else {
          let parentNode = target.parentNode!;
          while (!parentNode.nextSibling && parent !== parentNode) parentNode = parentNode.parentNode!

          if (parentNode.nextSibling) stack.push(parentNode.nextSibling);
        }
      } else {
        if (target.firstChild) {
          stack.push(target.firstChild);
        }
      }
    }

    return result;
  }

  export function getConnectedTextNodes(parent: HTMLElement, cursorNode: Text) {
    const result = [
      ...getTextNodesConnectedPrevious(parent, cursorNode),
      cursorNode,
      ...getTextNodesConnectedNext(parent, cursorNode)
    ];

    return result;
  }
}

export default Parser;
