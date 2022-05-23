import { Children, cloneElement, FC, PropsWithChildren, ReactElement, useEffect, useState } from "react";

const Masonry: FC<PropsWithChildren<{}
>> = ({ children }) => {
  let container: HTMLDivElement|null = null;
  let boxes: { [key: string]: any; } = {};

  // [init]
  // resize eventlistener
  // font loader
  // get container width
  const hello = () => console.log('hello');


  useEffect(() => {
    if (!container) return;

    let needUpdate = false;
    for (const child of container.children) {
      const childClientHeight = child.clientHeight;
      const { key, preinit, columns } = (child as HTMLElement).dataset;
      const targetBox = boxes[key as string];

      // 초기 계산 끝난 후 변화 없으면 continue
      if (!preinit &&
      targetBox.height === childClientHeight &&
      targetBox.columns === +(columns as string)) continue;
      else {
        boxes[key as string] = {
          height: childClientHeight,
        };
        needUpdate = true;
      }
    }

    needUpdate && setBoxPositions(boxes);
  }, []);

  const setBoxPositions = (props: typeof boxes) => {
    
  };

  const computedChildren = Children.map(children as ReactElement, (el: ReactElement, i) => {
    const key = el.key ?? '';
    const measured = boxes[key];
    return measured
    ? cloneElement(el, {
        "data-key": key,
        "key": key,
        "style": {
            left: Math.floor(measured.left),
            top: measured.top
        },
        "measured": true,
        "height": measured.height,
    })
    : cloneElement(el, {
        "data-key": key,
        "data-preinit": key,
        "key": key,
        "style": {
            visibility: "hidden"
        },
        "height": 0,
    });
  });

  return <div ref={el => container = el}>
    { computedChildren }
  </div>;
};

export default Masonry;