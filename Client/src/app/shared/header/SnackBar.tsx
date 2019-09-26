import React, { FC, useContext } from 'react';

import { MessageContext } from './MessageContext';
import { Snack } from './Snack';

export const SnackBar: FC = () => {
  const { snacks } = useContext(MessageContext);

  return (
    <div className='snack bar'>
      {snacks.map(snack => (
        <Snack {...snack} />
      ))}
    </div>
  );
};
