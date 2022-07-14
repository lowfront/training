import Editor from "./Editor";
import Parser from "./Parser";
import { getChildNodes, getLastChildNode, insertAfter, isHTML, isText, isWrappedInTag, removeIfEmpty } from "./utils";

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

    if (isText(anchorNode) && !isWrappedInTag(anchorNode, 'a')) {
      const paragraph = Parser.getCurrentParagraph(input, anchorNode);
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

      // FIXME: end split 이후 포커싱 문제: 1. deepSplit 이후 새 포커싱 위치 계산 + deepSplit작업이 완료되면 다시 일어나지 않도록 처리, 2. 역방향 deepSplit
    }
    return;

    if (isText(anchorNode) && isHTML(anchorNode.parentNode, "p")) {
      if (
        isHTML(anchorNode.previousSibling, "a") &&
        anchorOffset === 1 &&
        (ev as any).data !== " "
      ) {
        // link merge
        const a = anchorNode.previousSibling;
        if (!RegexHttp.test(a.textContent + anchorNode.nodeValue!)) return;

        if (anchorNode.nodeValue!.length > 1) {
          anchorNode.splitText(1);
        }
        const paragraph = anchorNode.parentNode!;
        paragraph.removeChild(anchorNode);
        a.textContent += anchorNode.nodeValue!;
        a.href = a.textContent!;
        Editor.focus(a.firstChild!, a.firstChild!.nodeValue!.length);
      } else {
        // link transform
        const text = anchorNode.nodeValue!;
        const matchArray = text.match(RegexHttp);
        if (!matchArray) return;

        const paragraph = anchorNode.parentNode!;
        const linkText = anchorNode.splitText(matchArray.index!);
        linkText.splitText(matchArray[0].length);
        const a = Object.assign(document.createElement("a"), {
          href: linkText.nodeValue,
        });
        paragraph.replaceChild(a, linkText);
        a.appendChild(linkText);
        Editor.focus(linkText, anchorOffset - matchArray.index!);
      }
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
  export function deepSplit(parent: Node, targetText: Text, offset: number) {
    const splitedText = targetText.splitText(offset);
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
