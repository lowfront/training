import Editor from "./Editor";

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
      const { isLast, paragraph } = Editor.isLastParagraph(
        input,
        anchorNode!,
        anchorOffset
      );

      if (isLast) {
        // EndOfParagraph
        const paragraphIndex = Editor.indexOf(input, paragraph);
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
