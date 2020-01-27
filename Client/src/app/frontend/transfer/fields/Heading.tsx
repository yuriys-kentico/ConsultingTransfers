import React, { FC } from 'react';
import { Header } from 'semantic-ui-react';

import { IFieldProps } from '../FieldHolder';

export const Heading: FC<IFieldProps> = ({ name, commentBlock }) => {
  return (
    <>
      <Header as={'h2'} content={name} />
      {commentBlock()}
    </>
  );
};
