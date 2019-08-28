import { FC, ReactNode } from 'react';

export interface IIFProps {
  shouldRender: boolean;
  children: ReactNode;
}

export const If: FC<IIFProps> = props => {
  return props.shouldRender ? props.children : (null as any);
};
