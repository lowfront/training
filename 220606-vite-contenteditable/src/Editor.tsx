import beautify from "beautify";
import { FC, useEffect, useRef } from "react";
import { pasteParse, nodeToEditorNodes } from "./utils/editor-node";

/*

input:
<root>
  <block>
    text node 1
    <block>
      text node 2
      <block>
        text node 3
      </block>
      text node 4
    </block>
  </block>
  text node 5
  <block>text node 6</block>
</root>

output:
<root>
  text node 1<br>
  text node 2<br>
  text node 3<br>
  text node 4<br>
  text node 5<br>
  text node 6<br>
</root>
*/
export type EditorNode = {
  type: 'node';
  node: Node;
  block: boolean;
  enter?: boolean;
} | {
  type: 'return';
};

const EditorReturnNode: EditorNode = {
  type: 'return',
} 

export class ContentEditableEditor {
  static BLOCK_TAGS = ['DIV', 'P', 'SECTION', 'MAIN', 'ARTICLE', 'BR'];
  static START_FRAGMENT = '<!--StartFragment-->';
  static END_FRAGMENT = '<!--EndFragment-->';

  div: HTMLDivElement = Object.assign(document.createElement('div'), { style: 'width: 100%; height: 100%;', contentEditable: true });

  pasteTrigger = false;
  pasteTempValue = '';

  constructor() {
    this.div.addEventListener('input', this.inputIntercept.bind(this));
    this.div.addEventListener('paste', this.pasteIntercept.bind(this));
  }
  
  inputIntercept(ev: Event) { // paste 로직 외에는 debounce 적용
    const target = this.div;
    
    if (this.pasteTrigger) {
      this.pasteTrigger = false;
      this.pasteTempValue = '';
      // target.innerHTML += this.pasteTempValue;
    }
  }

  pasteIntercept(ev: ClipboardEvent) { // debounce 없이 바로 변조
    ev.preventDefault();
    this.pasteTrigger = true;
    const htmlData = ev.clipboardData?.getData('text/html') ?? '';
    const root = pasteParse(htmlData);
    console.log(beautify(root.innerHTML, {format: 'html', }));

    let result = '';
    for (const editorNode of nodeToEditorNodes(root)) {
      // console.log(editorNode, editorNode.node.nodeValue);
      if (editorNode.block) result += '<br>';
      if (editorNode.text) result += editorNode.node.nodeValue;
    }
    this.pasteTempValue = result;

    this.div.innerHTML += this.pasteTempValue;
  };

  appendTo(element: HTMLElement) {
    element.appendChild(this.div);
  }
}

const Editor: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const contentEditableEditor = new ContentEditableEditor();
  
  useEffect(() => {
    if (!ref || !ref.current) return;
    contentEditableEditor.appendTo(ref.current);
  }, [ref]);

  return <div
    style={{
      border: '1px solid black',
      width: 500,
      height: 400,
      textAlign: 'left',
    }} 
    ref={ref}
  />;
};

export default Editor;
