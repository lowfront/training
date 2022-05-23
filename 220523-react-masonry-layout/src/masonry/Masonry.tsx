import { Children, cloneElement, FC, PropsWithChildren, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "./utils";

const Masonry: FC<PropsWithChildren<{}
>> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const container = useMemo(() => containerRef.current, [containerRef]);
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

  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const handler = debounce(() => {
      setContainerWidth(container?.clientWidth ?? 0);
    }, 100);
    document.addEventListener('resize', handler);

    return () => document.removeEventListener('resize', handler);
  }, [container]);

  const columns = useMemo(() => {
    return Math.max(1, Math.round(containerWidth / 300));
  }, [containerRef, container]);

  const setBoxPositions = (props: typeof boxes) => {
    const heights: number[] = [];

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

  return <div ref={containerRef}>
    { computedChildren }
  </div>;
};

export default Masonry;