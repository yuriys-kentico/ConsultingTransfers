import React, { FC } from 'react';

import { ISnack, Snack } from './Snack';

interface ISnackBarProps {
  snacks: ISnack[];
}

export const SnackBar: FC<ISnackBarProps> = ({ snacks }) => {
  return (
    <div className='snack bar'>
      {snacks.map(snack => (
        <Snack {...snack} />
      ))}
    </div>
  );
};
