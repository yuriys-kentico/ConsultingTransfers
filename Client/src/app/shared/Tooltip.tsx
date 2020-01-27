import React, { FC } from 'react';

interface ITooltipProps {
  label: string;
  position?: 'down';
}

export const Tooltip: FC<ITooltipProps> = ({ label: text, position, children }) => {
  return (
    <span data-balloon={text} data-balloon-pos={position || 'down'}>
      {children}
    </span>
  );
};
