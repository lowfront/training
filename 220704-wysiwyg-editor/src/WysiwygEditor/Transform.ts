import Editor from "./Editor";
import Parser from "./Parser";
import { getChildNodes, getLastChildNode, isHTML, isText } from "./utils";

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

    // console.log(anchorNode, anchorOffset);

    if (anchorNode === input && !input.firstChild) {
      // Enter in first
      Editor.appendParagraph(input);
      Editor.appendParagraph(input);
      focusOffset = 1;
    } else if (Parser.isLast(input, anchorNode!, anchorOffset)) {
      // Enter in end
      const lastParagraph = getLastChildNode(input);
      const paragraphIndex = Editor.indexOf(input, lastParagraph);
      Editor.appendParagraph(input, "", paragraphIndex + 1);
      focusOffset = paragraphIndex + 1;
    } else {
      // Enter in middle
      const currentParagraph = Parser.getCurrentParagraph(input, anchorNode!);
      const currentParagraphIndex =
        getChildNodes(input).indexOf(currentParagraph);
      const newParagraphIndex = currentParagraphIndex + 1;

      if (isText(anchorNode!)) {
        const splitedText = anchorNode.splitText(anchorOffset);
        const newParagraph = Editor.appendParagraph(
          input,
          splitedText.length ? splitedText : "",
          newParagraphIndex
        );

        if (!anchorNode.length) {
          currentParagraph.appendChild(document.createElement("br"));
        }

        if (splitedText.length) {
          focusNode = splitedText;
          focusOffset = 0;
        } else {
          focusNode = newParagraph;
          focusOffset = 0;
        }
      } else {
        const newParagraph = Editor.appendParagraph(
          input,
          "",
          newParagraphIndex
        );
        focusNode = newParagraph;
        focusOffset = 0;
      }
    }

    Editor.focus(focusNode, focusOffset);
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
}

export default Transform;
