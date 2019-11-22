import React, { FC } from 'react';
import { Header, Label } from 'semantic-ui-react';

import { IFile } from '../../../services/models/IFile';
import { getSizeText } from '../../../utilities/numbers';

interface IBlobDetailsProps {
  file: IFile;
}

export const BlobDetails: FC<IBlobDetailsProps> = ({ file }) => {
  const { name, sizeBytes, modified } = file;

  const [size, unit] = getSizeText(sizeBytes);

  return (
    <>
      <Header as='h5' sub content={name} />
      <Label content={`${size} ${unit}`} icon='save' size='tiny' />
      <Label content={`${modified.toLocaleString()}`} icon='calendar check outline' size='tiny' />
    </>
  );
};
