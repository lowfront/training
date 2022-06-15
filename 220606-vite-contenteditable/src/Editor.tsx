import beautify from "beautify";
import { ClipboardEvent, ClipboardEventHandler, FC, FormEvent, KeyboardEvent, SyntheticEvent, useCallback, useEffect, useRef, useState } from "react";
import { pasteParse, nodeToEditorNodes, isBr, enterTransform } from "./utils/editor-node";

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
    if (ev.code === 'Enter') enterTransform(ev, ref.current);
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
