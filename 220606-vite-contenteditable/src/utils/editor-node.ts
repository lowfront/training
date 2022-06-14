import { createDFSIterable } from "../helper/utils";

/*
- 파싱은 DFS(깊이우선) 순서로 진행한다. (첫번째 자식을 타고 확인해야하는 조건이 많음)
- Root 노드는 block(줄넘김) 속성을 갖지 않는다.
- Root 노드의 block 방지 속성은 첫번째 자식 노드에게 재귀적으로 전달된다.
- Block(줄넘김) 속성을 갖고 있는 노드는 첫번째 자식 노드에게 재귀적으로 전달된다.
- Block 노드의 block 속성은 가장 끝에 있는 자식 노드로 BR 태그를 만나면 무효화(줄넘김 방지) 된다.
- BR 태그는 트리파싱의 다음 순서 노드에게 block 속성을 부여한다.
- Block 속성의 태그는 다음 순서 노드에게 block 속성을 부여한다.
- PRE 태그는 모든 속성 무시하고 개행문자(\n) 기준으로 텍스트와 노드 분할

<span>
  123
  <div>
    abc
    <span>def</span>
  </div>
  456
</span>

*/

export const BLOCK_TAGS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'CANVAS', 'DD', 'DIV', 'DL', 'DT', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'NOSCRIPT', 'OL', 'P', 'PRE', 'SECTION', 'TABLE', 'TFOOT', 'UL', 'VIDEO'];
export const PRE_TAGS = ['PRE', 'CODE'];
export const START_FRAGMENT = '<!--StartFragment-->';
export const END_FRAGMENT = '<!--EndFragment-->';

export type EditorNode = {
  node: Node;
  block: boolean;
  root: boolean;
  text: boolean;
}

export function isHTMLElement(node: Node): node is HTMLElement {
  return node.nodeType === 1;
} 

export function isTextNode(node: Node) {
  return node.nodeType === 3;
}

export function pasteParse(str: string) {
  const startIndex = str.indexOf(START_FRAGMENT) + START_FRAGMENT.length;
  const endIndex = str.indexOf(END_FRAGMENT);
  
  const wrap = document.createElement('div');
  wrap.innerHTML = str.slice(startIndex, endIndex);

  return wrap;
}
export function getChildNodesByPre(editorNode: EditorNode) {
  const { node, root, block } = editorNode;
  const strings = node.textContent?.split('\n') ?? [];

  const childNodes = strings.map((str, i) => {
    return {
      node: document.createTextNode(str.replaceAll(' ', '&nbsp;')),
      block: i !== 0,
      root: i === 0,
      text: true,
    };
  });

  return childNodes;
}

export function getChildNodesByWithoutPre(editorNode: EditorNode) {
  const { node, root, block } = editorNode;

  let prevBr: boolean = false;
  let prevBlockTag: boolean = false;

  const childNodes = [...node.childNodes].map((childNode, index, array) => {
    const isRoot = root && !index;
    const isBlockByParent: boolean = !root && block && !index;

    const isPrevBlockTag = prevBlockTag;
    const isPrevBr = prevBr;
    
    prevBlockTag = prevBr = false;
    prevBlockTag ||= isHTMLElement(childNode) && BLOCK_TAGS.includes(childNode.tagName);
    prevBr ||= isHTMLElement(childNode) && childNode.tagName === 'BR';

    const result = {
      node: childNode,
      block: !isRoot && (isBlockByParent || isPrevBlockTag || isPrevBr),
      root: isRoot,
      text: isTextNode(childNode),
    };
    return result;
  });

  if (!childNodes.length) {
    return [
      {
        node: document.createTextNode(''),
        block: !root && block,
        root,
        text: true,
      }
    ];
  }

  return childNodes;
}

export function* nodeToEditorNodes(root: Node) {
  const editorNodeIterator = createDFSIterable<EditorNode>(
    {
      node: root,
      root: true,
      block: false,
      text: false,
    },
    editorNode => {
      const { node, root, block } = editorNode;
      if (isHTMLElement(node)) {
        const isPre = PRE_TAGS.includes(node.tagName);

        if (isPre) {
          return getChildNodesByPre(editorNode);
        } else {
          return getChildNodesByWithoutPre(editorNode);
        }
      }
    }
  );
  
  for (const editorNode of editorNodeIterator) {
    if (editorNode.text) yield editorNode;
  }
}

export function isBr(node: Node): node is HTMLBRElement {
  return node.nodeType === 1 && (node as HTMLElement).tagName === 'BR';
}