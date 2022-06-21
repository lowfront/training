import { KeyboardEvent } from "react";
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

export function isBr(node: Node|null): node is HTMLBRElement {
  return node?.nodeType === 1 && (node as HTMLElement).tagName === 'BR';
}

export function enterTransform(ev: KeyboardEvent, parentNode: HTMLElement) {
  ev.preventDefault();
  const selection = window.getSelection();
  if (!selection || !selection.anchorNode) return;
  const range = document.createRange();

  const { anchorNode, focusOffset } = selection;

  const isZeroWidth = parentNode === anchorNode;
  
  if (isZeroWidth) {
    const br = document.createElement('br');
    const insertBeforeTarget = parentNode.childNodes[focusOffset];
    if (!parentNode.childNodes.length) parentNode.appendChild(document.createElement('br'));
    insertBeforeTarget ? parentNode.insertBefore(br, insertBeforeTarget) : parentNode.appendChild(br);

    range.setStart(parentNode, focusOffset + 1);
  } else {
    (anchorNode as Text).splitText(focusOffset);
    const nextNode = anchorNode.nextSibling;
    let focusNode: Node;
    if (nextNode?.nodeValue) {
      parentNode.insertBefore(document.createElement('br'), nextNode);
      focusNode = nextNode;
    } else {
      focusNode = document.createElement('br');
      let checkBr = false;
      let computedNextNode: Node|null = nextNode;
      while (computedNextNode = computedNextNode?.nextSibling ?? null) checkBr ||= isBr(computedNextNode);
      
      // console.log(anchorNode, checkBr);
      parentNode.insertBefore(focusNode, nextNode);
      
      if (!checkBr) {
          parentNode.insertBefore(focusNode = document.createElement('br'), nextNode);
      } else {
        focusNode = focusNode.nextSibling as Node;
      }
    }
    // Selection.anchorNode가 BR 태그가 되면 포커싱이 잡히지 않음. BR태그 대신 부모 노드에서 offset으로 선택해야 함
    if (isBr(focusNode)) {
      const focusNodeIndex = [...parentNode.childNodes ?? []].indexOf(focusNode);
      range.setStart(parentNode, focusNodeIndex);
    } else {
      range.setStart(focusNode, 0);        
    }
  }
  
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

export const HTTP_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

export function linkTransform(ev: KeyboardEvent, parentNode: HTMLElement) {

  // save selection
  const selection = window.getSelection();
  if (!selection || !selection.anchorNode) return;
  const range = document.createRange();
  const { anchorNode, focusOffset } = selection;
  
  const isAnchorNodeSameParentNode = anchorNode === parentNode;
  const isAnchorNodeSameBr = isHTMLElement(anchorNode) && anchorNode.tagName === 'BR';
  const computedAnchorNode = isAnchorNodeSameBr ? parentNode : anchorNode;
  const computedFocusOffset = isAnchorNodeSameBr ? [...parentNode.childNodes].indexOf(anchorNode) : focusOffset;

export function linkTransform(ev: KeyboardEvent, parentNode: HTMLElement) {
  const nodeStructs = [...parentNode.childNodes].reduce((acc, node, i, { length }) => {
    if (isHTMLElement(node) && node.tagName === 'BR') {
      i !== length - 1 && acc.push([]);
      return acc;
    }
    if (!node.nodeValue && !node.textContent) return acc;
    const chn = acc[acc.length - 1];
    chn.push(node);
    return acc;
  }, [[]] as Node[][]);
  
  for (const nodes of nodeStructs) {
    if (!nodes.length) continue;
    
    for (const node of nodes as (Node | HTMLElement)[]) {
      if (node instanceof HTMLAnchorElement) {
        if (!node.textContent?.match(HTTP_REGEX)) {
          // remove anchor
          const parentNode = node.parentNode as Node;
          const childNodes = [...node.childNodes];
          childNodes.forEach(childNode => parentNode.insertBefore(childNode, node));
          parentNode.removeChild(node);
          // mergeSiblingTextNode(childNodes[0] as Text);
        } else {
          // update href
          node.href = node.textContent;
        }
      } else if (node instanceof Text) {
        let nextTextNode: Text = node;
        let matchResult: RegExpMatchArray|null;
        while (matchResult = (nextTextNode.nodeValue ?? '').match(HTTP_REGEX)) {
          console.log(matchResult);
          const {'0': target, index} = matchResult as typeof matchResult & { index: number };
          const anchorTextContent = node.splitText(index);
          nextTextNode = anchorTextContent.splitText(target.length);

          const anchor = Object.assign(document.createElement('a'), { href: anchorTextContent });
          const parentNode = anchorTextContent.parentNode as Node;
          parentNode.insertBefore(anchor, anchorTextContent);
          anchor.appendChild(anchorTextContent);
          // mergeSiblingTextNode(nextTextNode as Text);
    }

      }
    }
  }

  console.log(nodeStructs);

}