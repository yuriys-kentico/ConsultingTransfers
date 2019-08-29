import { FC } from 'react';
import React from 'react';
import { Loader } from 'semantic-ui-react';

export const Loading: FC = () => {
  return (
    <div>
      <Loader active />
    </div>
  );
};
