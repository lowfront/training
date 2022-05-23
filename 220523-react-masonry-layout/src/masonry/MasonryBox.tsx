import { FC, PropsWithChildren } from "react";

const MasonryBox: FC<PropsWithChildren<{ columns?: number; }>> = ({columns = 1, children, ...props}) => {
  return <div data-columns={columns} {...props}>{children}</div>
};

export default MasonryBox;