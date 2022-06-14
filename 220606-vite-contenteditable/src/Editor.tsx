import beautify from "beautify";
import { ClipboardEvent, ClipboardEventHandler, FC, FormEvent, KeyboardEvent, SyntheticEvent, useCallback, useEffect, useRef, useState } from "react";
import { pasteParse, nodeToEditorNodes, isBr } from "./utils/editor-node";

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

const Editor: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inputHandler = useCallback((ev: KeyboardEvent) => {
    if (!ref.current) return;
    if (ev.code === 'Enter') {
      const parentNode = ref.current;
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
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }

      (anchorNode as Text).splitText(focusOffset);
      const nextNode = anchorNode.nextSibling;
      let focusNode: Node;
      if (nextNode?.nodeValue) {
        parentNode.insertBefore(document.createElement('br'), nextNode);
        focusNode = nextNode;
      } else {
        focusNode = document.createElement('br');
        // focusNode = document.createElement('br');
        let checkBr = false;
        let computedNextNode: Node|null = nextNode;
        while (computedNextNode = computedNextNode?.nextSibling ?? null) checkBr ||= isBr(computedNextNode);
        
        console.log(anchorNode, checkBr);
        parentNode.insertBefore(focusNode, nextNode);
        
        if (!checkBr) {
            parentNode.insertBefore(focusNode = document.createElement('br'), nextNode);
        } else {
          focusNode = focusNode.nextSibling as Node;
        }
        // console.log(nextNode, parentNode.lastChild);
        // // 사라지기때문에 이걸로 하면 안됨
        // if (nextNode === parentNode.lastChild) {
        //   parentNode.insertBefore(focusNode = document.createElement('br'), nextNode);
        // }
      }
      // Selection.anchorNode가 BR 태그가 되면 포커싱이 잡히지 않음. BR태그 대신 부모 노드에서 offset으로 선택해야 함
      if (isBr(focusNode)) {
        const focusNodeIndex = [...parentNode.childNodes ?? []].indexOf(focusNode);
        range.setStart(parentNode, focusNodeIndex);
      } else {
        range.setStart(focusNode, 0);        
      }
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);

    }
  }, []);

  const pasteHandler = useCallback((ev: ClipboardEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    ev.preventDefault();
    const htmlData = ev.clipboardData?.getData('text/html') ?? '';
    const root = pasteParse(htmlData);
    
    let result = '';
    for (const editorNode of nodeToEditorNodes(root)) {
      if (editorNode.block) result += '<br>';
      if (editorNode.text) result += editorNode.node.nodeValue;
    }

    ref.current.innerHTML += result;
  }, []);

  return <div
    style={{
      border: '1px solid black',
      width: 500,
      height: 400,
      textAlign: 'left',
    }} 
    contentEditable
    onKeyDown={inputHandler}
    onPaste={pasteHandler}
    ref={ref}
  />;
};

export default Editor;
