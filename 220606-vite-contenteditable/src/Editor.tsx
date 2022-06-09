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
  static START_FRAGMENT = '<!--StartFragment-->';
  static END_FRAGMENT = '<!--EndFragment-->';

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

      target.innerHTML = result.map((nodes) => {
        return `${nodes.map(node => node.nodeValue).join('')}`
      }).join('<br>');
    }
  }

  pasteIntercept(ev: ClipboardEvent) { // debounce 없이 바로 변조
    this.pasteTrigger = true;
    const htmlData = ev.clipboardData?.getData('text/html') ?? '';
    const startIndex = htmlData.indexOf(ContentEditableEditor.START_FRAGMENT) + ContentEditableEditor.START_FRAGMENT.length;
    const endIndex = htmlData.indexOf(ContentEditableEditor.END_FRAGMENT);
    
    const wrap = document.createElement('div');
    console.log(wrap.innerHTML = htmlData.slice(startIndex, endIndex));
    
    type EditorNode = {
      node: Node;
      block: boolean;
      root: boolean;
      prevBr: boolean;
    };
/*
  규칙
  root의 첫번째 자식은 br을 제외하고는 무조건 block: false이다
  root는 첫번째 자식으로 재귀적으로 상속된다.
  block: true는 block속성을 가진 태그 노드, 또는 block: true 속성을 가진 노드의 첫번째 자식 노드에 부여된다.
  자식 노드 리스트 중 직전노드가 br이면 현재 노드의 block은 무조건 false이다.
  block: true는 최종 계산후 줄바꿈으로 변환된다. 

  <root>
    <first-child block=false>
      <first-child block=false>
        <first-child block=false>
          <br block=true>
        </first-child>
      </first-child>
    </first-child>
    <tag block=false>
      <tag block=true>
        text
      </tag>
      text
      <tag block=false></tag>
    </tag>
    <tag block=true></tag>
  </root>

  br 이후 바로 다음에 나온 block은 효과가 없음
  또는 br 등장하면 다음 노드는 무조건 block
*/
    const nodeIterable = createDFSIterable<EditorNode>(
      {
        node: wrap,
        block: false,
        root: true,
        prevBr: false,
      },
      (editorNode, stack) => {
        const isTag = editorNode.node.nodeType === 1;
        const isBlock = editorNode.block || editorNode.prevBr && !editorNode.root && isTag && ContentEditableEditor.BLOCK_TAGS.includes((editorNode.node as HTMLElement).tagName);

        if (isTag) {
          const childNodes = [...editorNode.node.childNodes].map((node, index, array) => {
            // console.log(node, (node as any)?.tagName === 'BR' || (array[index - 1] as any)?.tagName !== 'BR' && isBlock && index === 0);
            return {
              node,
              block: (node as any)?.tagName === 'BR' || isBlock && index === 0, // 부모가 block이면 첫 자식 줄바꿈, 자식이 BR인 경우 무조건 줄바꿈
              root: editorNode.root && index === 0,
              prevBr: (array[index - 1] as any)?.tagName !== 'BR',
            };
          });

          return childNodes;
        } else {
          return;
        }
      }
    );
    let result = '';
    for (const editorNode of nodeIterable) {
      if ((editorNode.node as any).tagName === 'BR' || (editorNode.node.nodeType === 3 && editorNode.block)) {
        result += '<br>';
      }
      if (editorNode.node.nodeType === 3) {
        result += editorNode.node.nodeValue;
      } 
    }
    console.log(result);
    // return result;
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