import { FC, ReactNode } from "react";

export interface IIFProps {
  shouldRender: boolean;
  children: ReactNode;
}

export const If: FC<IIFProps> = (props: IIFProps) => {
  if (props.shouldRender) {
    return props.children;
  }
  return null as any;
};
