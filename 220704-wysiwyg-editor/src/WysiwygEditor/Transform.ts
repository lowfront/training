import Editor from "./Editor";
import Parser from "./Parser";
import { getChildNodes, getLastChildNode, isText } from "./utils";

namespace Transform {
  export function enterTransform(input: HTMLElement, ev: KeyboardEvent) {
    ev.preventDefault();

    const selection = Editor.getSelection()!;
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
}

export default Transform;
