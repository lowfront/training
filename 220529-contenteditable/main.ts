const REGEX_URL = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

const editor = Object.assign(document.createElement('div'), {
  contentEditable: true,
  style: 'min-width: 400px; min-height: 300px; border: 1px solid black;'
}) as HTMLDivElement;

const cursor = document.createElement('div');

document.getElementById('root').appendChild(editor);
document.getElementById('root').appendChild(cursor);

const editHandler = (ev: Event) => {
  console.log('input', ev)
  const target = ev.target as HTMLDivElement;
  const selection = window.getSelection() as Selection;
  
  // if (target.childNodes.length === 1 && target.firstElementChild.tagName === 'br') {
  //   console.log('br');
  //   target.removeChild(target.firstElementChild);
  // } // 붙여넣기시 br 자식 생기는 버그 -> target이 contenteditable의 하위 자식으로 선택되어 생긴 버그

  // const anchorOffset = selection.anchorOffset ?? 0;

  // cursor.innerText = '' + anchorOffset;


  // if (target.firstChild.nodeType === 3) wrapTextNode(target);
  

  const lines = getLines(target);
  console.log(lines);
};
const wrapTextNode = (target: HTMLElement) => {
  const selection = window.getSelection() as Selection;
  const div = document.createElement('div');
  div.textContent = target.firstChild.nodeValue;
  target.replaceChild(div, target.firstChild);

  const range = document.createRange();
  range.setStart(div.lastChild, div.textContent.length);
  // range.setEnd(div.firstChild, div.textContent.length);
  range.collapse(true);
  
  selection.removeAllRanges();
  selection.addRange(range);
};

const getTextNodesByRoot = (rootNode: Node) => {
  const stack: Node[] = [rootNode];
  const textNodes: Node[] = [];
  let target: Node;
  while (target = stack.shift()) {
    if (target.nodeType === 3) textNodes.push(target);
    stack.unshift(...target.childNodes);
  }

  return textNodes;
};

const getLines = (rootNode: Node) => {
  return [...rootNode.childNodes].map(getTextNodesByRoot);
};

const startFragment = '<!--StartFragment-->';
const endFragment = '<!--EndFragment-->';

const blockTags = ['DIV', 'P', 'SECTION', 'MAIN', 'ARTICLE', 'BR'];

const pasteHandler = (ev: ClipboardEvent) => {
  ev.preventDefault();
  console.log('paste', ev);
  const htmlData = ev.clipboardData.getData('text/html');
  const startIndex = htmlData.indexOf(startFragment) + startFragment.length;
  const endIndex = htmlData.indexOf(endFragment);
  const wrap = document.createElement('div');
  wrap.innerHTML = htmlData.slice(startIndex, endIndex);
  type StackItem =
  | {
    type: 'text',
    node: Node;
    i: boolean;
    u: boolean;
    b: boolean;
    block: boolean;
    color: string;
  } 
  | {
    type: 'group',
    node: Node;
    i: boolean;
    u: boolean;
    b: boolean;
    block: boolean;
    color: string;
  };
  function nodeToStackItem(node: Node, parentStackItem: StackItem|Partial<StackItem> = {}) {
    const block = blockTags.includes((node as HTMLElement).tagName);

    return {
      type: node.nodeType === 1 ? 'group' : 'text',
      node,
      i: parentStackItem.i ?? false,
      u: parentStackItem.u ?? false,
      b: parentStackItem.b ?? false,
      block,
      color: (node as HTMLElement).style?.color ?? (parentStackItem.color ?? ''),
    } as StackItem;
  }
  const stack: StackItem[] = [...wrap.childNodes].map(node => nodeToStackItem(node));
  const result = [[]];
  let target: StackItem;
  
  while (target = stack.shift()) {
    const { node } = target;
    if (node.nodeType === 1) {
      if (target.block && result[result.length - 1].length) result.push([]);
      
      
      const items = [...node.childNodes].map(nodeChild => {
        return nodeToStackItem(nodeChild, target);
      });
      stack.unshift(...items);
    } else {
      result[result.length - 1].push(Object.assign(target, {style: ''}));
    }
  }
  console.log(result);

  let resultHTML = '';
  for (const item of result) {
    const div = document.createElement('div');
    for (const { node, color } of item) {
      const span = Object.assign(document.createElement('span'), {});//, { style: `color: ${color}` });
      span.appendChild(node);
      div.appendChild(span);
    }
    resultHTML += div.outerHTML;
  }
  (ev.currentTarget as HTMLElement).innerHTML += resultHTML;
};

const debounce = <T extends any[]>(f: (...args: T) => void, ms: number) => {
  let timer: number;
  return  (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout((args: T) => f(...args), ms, args);
  };
};

// editor.addEventListener('input', debounce(editHandler, 100));
editor.addEventListener('paste', pasteHandler);

/*
<div>
  <div>A</div>
  B
</div>

<div>A</div>
<div>B</div>
*/