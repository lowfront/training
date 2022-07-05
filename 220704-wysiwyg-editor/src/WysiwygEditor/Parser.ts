import Editor from "./Editor";
import { isHTML } from "./utils";

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
}

export default Parser;
