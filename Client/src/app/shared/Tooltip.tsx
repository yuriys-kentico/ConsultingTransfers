import React, { FC } from 'react';

interface ITooltipProps {
  text: string;
  position?: 'down';
}

export const Tooltip: FC<ITooltipProps> = ({ text, position, children }) => {
  return (
    <span data-balloon={text} data-balloon-pos={position || 'down'}>
      {children}
    </span>
  );
};
