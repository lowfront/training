import Editor from "./Editor";
import Parser from "./Parser";
import { getChildNodes, getLastChildNode, isHTML, isText } from "./utils";

namespace Transform {
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

    console.log(anchorNode, anchorOffset);

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
        console.log("not text");
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
    if (ev.inputType === "deleteContentBackward") {
    } else if (ev.inputType === "deleteContentForward") {
    }
  }
}

export default Transform;
