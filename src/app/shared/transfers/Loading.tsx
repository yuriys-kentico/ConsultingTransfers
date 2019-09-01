import { FC } from 'react';
import React from 'react';
import { Loader, Segment } from 'semantic-ui-react';

export const Loading: FC = () => {
  return (
    <div>
      <Loader as={Segment} active basic />
    </div>
  );
};
