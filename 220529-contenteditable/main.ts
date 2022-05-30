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
  
  const anchorOffset = selection.anchorOffset ?? 0;

  cursor.innerText = '' + anchorOffset;

  if (target.firstChild.nodeType === 3) wrapTextNode(target);
  

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
  // const spreadNodes: Node[] = [];
  
  // const childNodes = [...rootNode.childNodes];
  // let nodeStartIndex = -1;
  // let divStartIndex = -1;
  // for (let i = 0; i < childNodes.length; i++) {
  //   const node = childNodes[i] as HTMLElement;
  //   if (node.tagName === 'DIV') {
  //     if (divStartIndex === -1) divStartIndex = i;
  //   } else if (nodeStartIndex === -1) {
  //     nodeStartIndex = i;
  //   }

  //   if (divStartIndex !== -1 && nodeStartIndex !== -1) break;
  // }
  // console.log('nodeStartIndex', nodeStartIndex);
  // console.log('divStartIndex', divStartIndex);

  return [...rootNode.childNodes].map(getTextNodesByRoot);
};

const startFragment = '<!--StartFragment-->';
const endFragment = '<!--EndFragment-->';

const pasteHandler = (ev: ClipboardEvent) => {
  console.log('paste', ev);
  const target = ev.target as HTMLDivElement;
  const htmlData = ev.clipboardData.getData('text/html');
  const startIndex = htmlData.indexOf(startFragment) + startFragment.length;
  const endIndex = htmlData.indexOf(endFragment);
  const docFrag = document.createDocumentFragment();
  const wrap = document.createElement('div');
  wrap.innerHTML = htmlData.slice(startIndex, endIndex);
  docFrag.append(...wrap.childNodes);
  

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