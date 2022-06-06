const REGEX_URL = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

const editor = Object.assign(document.createElement('div'), {
  contentEditable: true,
  style: 'min-width: 400px; min-height: 300px; border: 1px solid black;'
}) as HTMLDivElement;

const cursor = document.createElement('div');

document.getElementById('root').appendChild(editor);
document.getElementById('root').appendChild(cursor);

const editHandler = (ev: Event) => {};

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

const START_FRAGMENT = '<!--StartFragment-->';
const END_FRAGMENT = '<!--EndFragment-->';

const blockTags = ['DIV', 'P', 'SECTION', 'MAIN', 'ARTICLE', 'BR'];

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

function nodeToStackItem(node: Node, parentStackItem: Partial<StackItem> = {}) {
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

const pasteHandler = (ev: ClipboardEvent) => {
  ev.preventDefault();
  const htmlData = ev.clipboardData.getData('text/html');
  const startIndex = htmlData.indexOf(START_FRAGMENT) + START_FRAGMENT.length;
  const endIndex = htmlData.indexOf(END_FRAGMENT);
  const wrap = document.createElement('div');
  wrap.innerHTML = htmlData.slice(startIndex, endIndex);

  const stack: StackItem[] = [...wrap.childNodes].map(node => nodeToStackItem(node));
  const result: StackItem[][] = [[]];
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

editor.addEventListener('input', debounce(editHandler, 100));
editor.addEventListener('paste', pasteHandler);

/*
<div>
  <div>A</div>
  B
</div>

<div>A</div>
<div>B</div>
*/