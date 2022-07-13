import Parser from "./Parser";
import Transform from "./Transform";
import "./index.css";
import Editor from "./Editor";

namespace WysiwygEditor {
  function handleKeyDown(input: HTMLElement, ev: InputEvent) {
    if (ev.inputType === "insertParagraph") Transform.enterTransform(input, ev);
    else if (
      ev.inputType === "deleteContentBackward" ||
      ev.inputType === "deleteContentForward" ||
      ev.inputType === "deleteWordForward" ||
      ev.inputType === "deleteWordBackward"
    ) {
      Transform.deleteTransform(input, ev);
    } else {
      Transform.linkTransform(input, ev);
    }
    Transform.lastWrap(input);
  }
  function handleKeyUp(input: HTMLElement, ev: KeyboardEvent) {}

  function createHandleKeyDown(input: HTMLElement) {
    return handleKeyDown.bind(null, input);
  }

  function createHandleKeyUp(input: HTMLElement) {
    return handleKeyUp.bind(null, input);
  }

  function createHandlePaste(input: HTMLElement) {
    return (ev: ClipboardEvent) => {};
  }

  export function create(input: HTMLElement) {
    input.className = "wysiwyg-editor";
    input.contentEditable = "true";

    Transform.initWrap(input);

    const handleKeyDown = createHandleKeyDown(input);
    const handleKeyUp = createHandleKeyUp(input);
    const handlePaste = createHandlePaste(input);

    input.addEventListener("input", handleKeyDown as any);
    input.addEventListener("keyup", handleKeyUp);
    input.addEventListener("paste", handlePaste);

    return function destory() {
      input.removeEventListener("input", handleKeyDown as any);
      input.removeEventListener("keyup", handleKeyUp);
      input.removeEventListener("paste", handlePaste);
    };
  }
}

export default WysiwygEditor;
