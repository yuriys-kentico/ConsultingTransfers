import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC } from 'react';
import { Header, Label, SemanticCOLORS } from 'semantic-ui-react';

import { getSizeText } from '../../../utilities/numbers';

interface IBlobDetailsProps {
  file: BlobItem;
  fileName: string;
  color?: SemanticCOLORS;
}

export const BlobDetails: FC<IBlobDetailsProps> = ({ file, fileName, color }) => {
  const { contentLength, lastModified } = file.properties;

  const [size, unit] = getSizeText(contentLength);

  return (
    <div>
      <Header as='h5' sub content={fileName} color={color} />
      <Label content={`${size} ${unit}`} icon='save' size='tiny' />
      <Label content={`${lastModified.toLocaleString()}`} icon='calendar check outline' size='tiny' />
    </div>
  );
};
