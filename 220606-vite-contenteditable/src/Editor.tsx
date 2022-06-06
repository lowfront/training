import { ClipboardEventHandler, FC, FormEventHandler, useCallback, useEffect, useRef } from "react";
import { createDFSIterable } from "./helper/utils";

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

  div: HTMLDivElement = Object.assign(document.createElement('div'), { style: 'width: 100%; height: 100%;', contentEditable: true });

  pasteTrigger = false;

  constructor() {
    this.div.addEventListener('input', this.inputIntercept.bind(this));
    this.div.addEventListener('paste', this.pasteIntercept.bind(this));
  }
  
  inputIntercept(ev: Event) { // paste 로직 외에는 debounce 적용
    const target = this.div;
    
    if (this.pasteTrigger) {
      const nodeIterable = createDFSIterable<EditorNode>(
        {
          type: 'node',
          node: target as Node,
          block: false,
        }, 
        (editorNode, stack) => {
          if (editorNode.type === 'node') {
            const { type, node, block, enter } = editorNode;
            const nextEditorNodes = [...node.childNodes].map(childNode => {
              return {
                type: 'node',
                node: childNode,
                block: childNode.nodeType === 1 && ContentEditableEditor.BLOCK_TAGS.includes((childNode as HTMLDivElement).tagName),
                enter: false,
              } as EditorNode;
            });
            return nextEditorNodes.concat(block ? [EditorReturnNode] : []);
          } else if (editorNode.type === 'return') {
  
          }
        }
      );
    
      const result: Node[][] = [[]];
      for (const editorNode of nodeIterable) {
        if (editorNode.type === 'return') {
          result.push([]);
          continue;
        } 
        const { node, block, enter } = editorNode;
        if (node.nodeType !== 1) result[result.length - 1].push(node);
      }
      console.log(result);
      this.pasteTrigger = false;
      console.log('[paste trigger end]');

      target.innerHTML = result.map((nodes) => {
        return `${nodes.map(node => node.nodeValue).join('')}`
      }).join('<br>');
    }
  }

  pasteIntercept(ev: ClipboardEvent) { // debounce 없이 바로 변조
    console.log('[paste trigger start]');
    this.pasteTrigger = true;
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
    }} 
    ref={ref}
  />;
};

export default Editor;