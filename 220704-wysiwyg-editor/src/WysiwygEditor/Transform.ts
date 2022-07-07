import Editor from "./Editor";
import Parser from "./Parser";
import { getLastChildNode } from "./utils";

namespace Transform {
  export function enterTransform(input: HTMLElement, ev: KeyboardEvent) {
    ev.preventDefault();

    const selection = Editor.getSelection()!;
    const { anchorNode, anchorOffset } = selection;

    let focusNode: Node = input;
    let focusOffset: number = -1;
    if (anchorNode === input && !input.firstChild) {
      // FirstEnter
      Editor.appendParagraph(input);
      Editor.appendParagraph(input);
      focusOffset = 1;
    } else {
      // console.log(anchorNode, anchorOffset);

      const isLast = Parser.isLast(input, anchorNode!, anchorOffset);

      if (isLast) {
        // EndOfParagraph
        const lastParagraph = getLastChildNode(input);
        const paragraphIndex = Editor.indexOf(input, lastParagraph);
        Editor.appendParagraph(input, "", paragraphIndex + 1);
        focusOffset = paragraphIndex + 1;
      }

      if (anchorNode!.nodeType === 3) {
      }
    }

    Editor.focus(focusNode, focusOffset);
  }
}

export default Transform;
