export type TextEditorNode = {
  node: Node;
  block: boolean;
  root: boolean;
  text: boolean;
};

export type FocusParams = {
  node: Node;
  offset: number;
};

export function isHTMLElement(node: Node|null): node is HTMLElement {
  return node?.nodeType === 1;
}

export function isTag<K extends keyof HTMLElementTagNameMap>(tagName: K, node: Node|null): node is HTMLElementTagNameMap[K] {
  return isHTMLElement(node) && node.tagName === tagName;
}

class TextEditor {
  static BlockTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'CANVAS', 'DD', 'DIV', 'DL', 'DT', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'NOSCRIPT', 'OL', 'P', 'PRE', 'SECTION', 'TABLE', 'TFOOT', 'UL', 'VIDEO'];
  static PreTags = ['PRE', 'CODE'];
  static StartFragment = '<!--StartFragment-->';
  static EndFragment = '<!--EndFragment-->';
  #handleKeyPress: typeof this.handleKeyPress;
  #handlePaste: typeof this.handlePaste;

  constructor(private input: HTMLElement) {
    input.addEventListener('keypress', this.#handleKeyPress = this.handleKeyPress.bind(this));
    input.addEventListener('paste', this.#handlePaste = this.handlePaste.bind(this));
  }

  destory() {
    this.input.removeEventListener('keypress', this.#handleKeyPress);
    this.input.removeEventListener('paste', this.#handlePaste);
  }

  handleKeyPress(ev: KeyboardEvent) {
    if (ev.code === 'Enter') this.enterTransform(ev);

    // debouncedLineTransform(ev, editorNode);
  }
  handlePaste(ev: ClipboardEvent) {

  }

  getSelection() {
    const selection = window.getSelection() as Selection;
    const { anchorNode, focusOffset } = selection;

    return { anchorNode, focusOffset } as { anchorNode: Node; focusOffset: number; };
  }

  focusNode(node: Node, offset: number) {
    const selection = window.getSelection() as Selection;
    const range = document.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  enterTransform(ev: KeyboardEvent): FocusParams {
    ev.preventDefault();
    const { input } = this;
    const { anchorNode, focusOffset } = this.getSelection();
  
    const isZeroWidth = input === anchorNode;
    
    if (isZeroWidth) {
      const br = document.createElement('br');
      const insertBeforeTarget = input.childNodes[focusOffset];
      if (!input.childNodes.length) input.appendChild(document.createElement('br'));
      insertBeforeTarget ? input.insertBefore(br, insertBeforeTarget) : input.appendChild(br);
  
      return {
        node: input,
        offset: focusOffset + 1,
      };
    } else {
      (anchorNode as Text).splitText(focusOffset);
      const nextNode = anchorNode.nextSibling;
      let focusNode: Node;
      if (nextNode?.nodeValue) {
        input.insertBefore(document.createElement('br'), nextNode);
        focusNode = nextNode;
      } else {
        focusNode = document.createElement('br');
        let checkBr = false;
        let computedNextNode: Node|null = nextNode;
        while (computedNextNode = computedNextNode?.nextSibling ?? null) checkBr ||= isTag('br', computedNextNode);
        
        input.insertBefore(focusNode, nextNode);
        
        if (!checkBr) {
          input.insertBefore(focusNode = document.createElement('br'), nextNode);
        } else {
          focusNode = focusNode.nextSibling as Node;
        }
      }

      // Selection.anchorNode가 BR 태그가 되면 포커싱이 잡히지 않음. BR태그 대신 부모 노드에서 offset으로 선택해야 함
      if (isTag('br', focusNode)) {
        const focusNodeIndex = [...input.childNodes ?? []].indexOf(focusNode);
        
        return {
          node: input,
          offset: focusNodeIndex,
        };
      } else {
        return {
          node: focusNode,
          offset: 0,
        };
      }
    }
  }
}

export default TextEditor;
