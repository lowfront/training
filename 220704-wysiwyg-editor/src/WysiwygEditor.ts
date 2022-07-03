import "./WysiwygEditor.css";

function isHTML<K extends keyof HTMLElementTagNameMap>(
  node: Node | null,
  tagName: K
): node is HTMLElementTagNameMap[K] {
  return (
    node?.nodeType === 1 &&
    (node as HTMLElement).tagName === tagName.toUpperCase()
  );
}

function isText(node: Node): node is Text {
  return node.nodeType === 3;
}

function isLastOfParagraph(node: Node) {
  let targetNode = node;
  let isLast = true;

  while (!isHTML(targetNode, "p")) {
    const childNodes = [...targetNode.parentNode!.childNodes];
    isLast = childNodes[childNodes.length - 1] === targetNode;
    targetNode = targetNode.parentNode!;
  }

  return {
    isLast,
    paragraph: targetNode,
  };
}

class Viewport {
  constructor(private element: HTMLElement) {}
}

class WysiwygEditorParser {
  constructor(private viewport: HTMLElement) {}

  firstWrap() {
    // first keydown
    if (this.viewport.firstChild) {
      if (!isHTML(this.viewport.firstChild, "p")) {
        const text = this.viewport.firstChild as Text;
        this.appendParagraph().append(text);
        this.focus(text, text.length);
      }
    }
  }

  lastWrap() {
    // keyup
    if (this.hasOneEmptyParagraph()) {
      this.viewport.firstChild!.remove();
      this.focus(this.viewport, 0);
    }
  }

  getSelection() {
    return window.getSelection()!;
  }

  focus(node: Node, offset: number) {
    const selection = this.getSelection();
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  enterTransform(ev: KeyboardEvent) {
    ev.preventDefault();

    const { anchorNode, anchorOffset } = this.getSelection();
    console.log(anchorNode, anchorOffset);
    let focusNode: Node = this.viewport;
    let focusOffset: number = -1;
    if (anchorNode === this.viewport && !this.viewport.firstChild) {
      // FirstEnter
      this.appendParagraph();
      this.appendParagraph();
      focusOffset = 1;
    }

    const childNodes = [...this.viewport.childNodes];
    const { isLast, paragraph } = isLastOfParagraph(anchorNode!);
    if (isLast) {
      // EndOfParagraph
      console.log("end of paragraph");
      const paragraphIndex = this.indexOfViewport(paragraph);
      this.appendParagraph("", paragraphIndex + 1);
      focusOffset = paragraphIndex + 1;
    }

    if (anchorNode!.nodeType === 3) {
    }

    this.focus(focusNode, focusOffset);
  }

  appendParagraph(textContent?: string, insertIndex?: number) {
    const p = document.createElement("p");
    textContent && (p.textContent = textContent);

    if (insertIndex === undefined) {
      this.viewport.append(p);
    } else {
      console.log([...this.viewport.childNodes][insertIndex]);
      this.viewport.insertBefore(p, [...this.viewport.childNodes][insertIndex]);
    }
    return p;
  }
  indexOfViewport(node: Node) {
    return [...this.viewport.childNodes].indexOf(node as ChildNode);
  }

  hasOneEmptyParagraph() {
    return (
      !this.viewport.firstChild?.nextSibling &&
      !this.viewport.firstChild!.textContent
    );
  }
}

export class WysiwygEditor {
  parser: WysiwygEditorParser;

  constructor(private viewport: HTMLElement) {
    viewport.className = "wysiwyg-editor";
    viewport.contentEditable = "true";
    viewport.addEventListener("keydown", this.handleInput.bind(this));
    viewport.addEventListener("keyup", this.handleUp.bind(this));
    viewport.addEventListener("paste", this.handlePaste.bind(this));

    this.parser = new WysiwygEditorParser(viewport);
  }

  handleInput(ev: KeyboardEvent) {
    this.parser.firstWrap();
    if (ev.code === "Enter") this.parser.enterTransform(ev);
  }
  handleUp(ev: KeyboardEvent) {
    this.parser.lastWrap();
  }

  handlePaste(ev: ClipboardEvent) {}
}
