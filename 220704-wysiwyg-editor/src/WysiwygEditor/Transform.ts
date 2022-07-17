import Editor from "./Editor";
import Parser from "./Parser";
import { findPreviousSiblingDeep, getChildNodes, getLastChildNode, insertAfter, isHTML, isText, isWrappedInTag, previousSiblingTextDeep, removeIfEmpty } from "./utils";

namespace Transform {
  export function initWrap(input: HTMLElement) {
    lastWrap(input);
  }

  export function lastWrap(input: HTMLElement) {
    if (getChildNodes(input).length === 0) {
      Editor.appendParagraph(input);
    }
  }

  export const RegexHttp =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  export function linkTransform(input: HTMLElement, ev: InputEvent) {
    const selection = Editor.getSelection();
    const { anchorNode, anchorOffset } = selection;
    
    const paragraph = Parser.getCurrentParagraph(input, anchorNode);
    const a = findPreviousSiblingDeep(paragraph, anchorNode, node => isHTML(node, 'a')) as HTMLAnchorElement|null;
    if (isText(anchorNode) && !/^\s$/.test(anchorNode.data) && anchorNode.data.length === 1 && a) {
      // link merge
      if (RegexHttp.test(a.textContent + anchorNode.data)) {
        const char = anchorNode.splitText(0);
        const textNode = previousSiblingTextDeep(paragraph,anchorNode) as Text;
        console.log(textNode, char);
        textNode.data += char.data;
        char.remove();

        return;
      }
    }

    if (isText(anchorNode) && !isWrappedInTag(anchorNode, 'a')) {
      const textNodes = Parser.getConnectedTextNodes(paragraph, anchorNode);
      const textContent = textNodes.reduce((acc, { data }) => acc + data, '');
      console.log('textContent', textContent);
      const matchArray = textContent.match(RegexHttp);
      if (!matchArray) return;

      const { 0: linkText, index } = matchArray as RegExpMatchArray & { index: number };

      let length = index;
      let linkStart!: Text;
      let linkStartOffset!: number;
      let linkEnd!: Text;
      let linkEndOffset!: number;
      for (const text of textNodes) {
        const textLength = text.data.length;
        if (!linkStart && textLength - length > 0) {
          linkStart = text;
          linkStartOffset = length;
        }

        if (textLength - (length + linkText.length) >= 0) {
          linkEnd = text;
          linkEndOffset = length + linkText.length;
          break;
        }

        length -= textLength;
      }
      console.log('textNodes', textNodes);
      console.log('linkStart', linkStart.data, linkStartOffset);
      console.log('linkEnd', linkEnd.data, linkEndOffset);
      
      const startSplitedNodeArray = deepSplit(paragraph, linkStart, linkStartOffset);

      if (linkStart === linkEnd) {
        console.log('same link node')
        linkEnd = startSplitedNodeArray[0] as Text;
        linkEndOffset = linkText.length;
      }
      console.log('linkEnd2', linkEnd.data, linkEndOffset);

      const endSplitedNodeArray = deepSplit(paragraph, linkEnd, linkEndOffset);

      console.log('startSplitedNodeArray', startSplitedNodeArray)
      console.log('endSplitedNodeArray', endSplitedNodeArray)
      const linkChildNodes = startSplitedNodeArray.filter(item => !endSplitedNodeArray.includes(item));

      console.log('[linkChildNodes]', linkChildNodes);

      if (!linkChildNodes.length) return;

      const a = document.createElement('a');
      a.href = linkChildNodes.reduce((acc, { textContent }) => acc + textContent, '');
      paragraph.insertBefore(a, linkChildNodes[0]);
      linkChildNodes.forEach(node => a.appendChild(node));
    }
  }

  export function enterTransform(input: HTMLElement, ev: InputEvent) {
    ev.preventDefault();

    const selection = Editor.getSelection();
    const { anchorNode, anchorOffset } = selection;

    let focusNode: Node = input;
    let focusOffset: number = -1;

    /* a tag cleanup after enter */
  }

  export function deleteTransform(input: HTMLElement, ev: InputEvent) {
    const selection = Editor.getSelection();
    const { anchorNode, anchorOffset } = selection;

    let anchorElement: HTMLAnchorElement | null = null;
    let anchorHref: string = "";
    if (isText(anchorNode) && isHTML(anchorNode.parentNode, "a")) {
      anchorElement = anchorNode.parentNode;
      anchorHref = anchorNode.nodeValue!;
    } else if (
      ev.inputType === "deleteContentBackward" ||
      ev.inputType === "deleteWordBackward"
    ) {
      // backspace
      console.log("down backspace");
      if (
        isText(anchorNode) &&
        isHTML(anchorNode.previousSibling, "a") &&
        anchorOffset === 0
      ) {
        console.log("previous HTMLAnchorElement");
      }
    } else if (
      ev.inputType === "deleteContentForward" ||
      ev.inputType === "deleteWordForward"
    ) {
      // delete
      if (
        isText(anchorNode) &&
        isHTML(anchorNode.nextSibling, "a") &&
        anchorOffset === anchorNode.nodeValue!.length
      ) {
        anchorElement = anchorNode.nextSibling;
        anchorHref = anchorNode.nextSibling.textContent!;
      }
    }

    if (!anchorElement) return;

    if (RegexHttp.test(anchorHref)) {
      // new link
      anchorElement.href = anchorHref;
    } else {
      // not link
      const childNodes = [...anchorElement.childNodes];
      childNodes.forEach((child) => anchorElement!.removeChild(child));
      childNodes
        .reverse()
        .forEach((child) =>
          anchorElement!.parentNode!.insertBefore(child, anchorElement)
        );
      anchorElement!.parentNode!.removeChild(anchorElement!);

      Editor.focus(anchorNode, anchorOffset);
    }
  }
  export function cleanEmpty(input: HTMLElement) {
    const selection = Editor.getSelection();
    const { anchorNode, anchorOffset } = selection;
    const paragraph = Parser.getCurrentParagraph(input, anchorNode);

    paragraph.childNodes.forEach(childNode => {
      if (childNode.nodeType === 1) {
        removeIfEmpty(input, childNode);
      } else if (isText(childNode)) {
        if (!childNode.data.length) childNode.remove();
      }
    })
  }

  function getDeepOffsetText(node: Node, offset: number) {
    const initOffset = offset;
    const stack: Node[] = [node];
    let target: Node|undefined;
    while (target = stack.shift()) {
      if (isText(target)) {
        if (target.data.length < offset) {
          offset -= target.data.length;
        } else {
          break;
        }
      } else {
        stack.unshift(...[...target.childNodes]);
      }
    }
    if (!target) throw new Error(`Invalid offset: ${initOffset}`);

    return {
      node: target,
      offset
    };
  }

  export function deepSplitText(parent: Node, node: Node, offset: number) {
    const { node: targetText, offset: offsetText } = getDeepOffsetText(node, offset);

    const splitedText = (targetText as Text).splitText(offsetText);
    let target: Node = splitedText;

    let clonedParent: Node|null = null;
    // FIXME: splitedText.data가 없고 자식이 하나도 없으면 clonedParent를 생성하지 않아야 함
    while (target.parentNode !== parent) {
      // 부모 복제가 일어나면 이전 부모 append
      if (clonedParent) {
        const clone = target.parentNode!.cloneNode(false);
        clone.appendChild(clonedParent);
        clonedParent = clone;
      } else {
        clonedParent = target.parentNode!.cloneNode(false);
      }

      let targetSibling: Node|null = target.nextSibling;
      const currentParentNode = target.parentNode!;

      // 나누는 대상 텍스트는 clonedParent의 자식이 됨
      if (target === splitedText) clonedParent.appendChild(target);

      target = currentParentNode;
      
      // 나누는 대상 텍스트의 부모는 원본 텍스트를 위해 남겨두고 형제 노드만 clonedParent의 자식이 됨
      while (targetSibling) {
        clonedParent.appendChild(targetSibling);
        targetSibling = targetSibling.nextSibling;
      }

    }

    if (clonedParent) {
      insertAfter(clonedParent, target);
    }

    const result: Node[] = [];
    let targetSibling: Node|null = clonedParent ?? splitedText;
    while (targetSibling) {
      result.push(targetSibling);
      targetSibling = targetSibling.nextSibling;
    }

    if (!targetText.length) {
      const currentParent = targetText.parentNode!;
      targetText.remove();
      removeIfEmpty(parent, currentParent);
    }
    if (!splitedText.length) {
      const currentParent = targetText.parentNode!;
      splitedText.remove();
      removeIfEmpty(parent, currentParent);
      // if (result.includes(splitedText)) {
      //   result.splice(result.indexOf(splitedText), 1);
      // }
    }
    return result;
  }
}

export default Transform;
