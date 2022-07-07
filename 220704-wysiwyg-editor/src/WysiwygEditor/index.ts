import Parser from "./Parser";
import Transform from "./Transform";
import "./index.css";

namespace WysiwygEditor {
  function handleKeyDown(input: HTMLElement, ev: KeyboardEvent) {
    Parser.firstWrap(input);

    if (ev.code === "Enter") Transform.enterTransform(input, ev);
  }
  function handleKeyUp(input: HTMLElement, ev: KeyboardEvent) {
    Parser.lastWrap(input);
  }

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

    const handleKeyDown = createHandleKeyDown(input);
    const handleKeyUp = createHandleKeyUp(input);
    const handlePaste = createHandlePaste(input);

    input.addEventListener("keydown", handleKeyDown);
    input.addEventListener("keyup", handleKeyUp);
    input.addEventListener("paste", handlePaste);

    return function destory() {
      input.removeEventListener("keydown", handleKeyDown);
      input.removeEventListener("keyup", handleKeyUp);
      input.removeEventListener("paste", handlePaste);
    };
  }
}

export default WysiwygEditor;