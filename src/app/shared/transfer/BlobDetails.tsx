import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC } from 'react';
import { Header, Label } from 'semantic-ui-react';

import { AzureStorage } from '../../../connectors/azure/azureStorage';
import { getSizeText } from '../../../utilities/numbers';

interface IBlobDetailsProps {
  file: BlobItem;
  fileName: string;
}

export const BlobDetails: FC<IBlobDetailsProps> = ({ file, fileName }) => {
  const { contentLength, lastModified } = file.properties;

  const [size, unit] = getSizeText(contentLength);

  return (
    <div>
      <Header
        as='h5'
        sub
        content={fileName}
        color={fileName ? (fileName.endsWith(AzureStorage.completed) ? 'green' : 'black') : 'black'}
      />
      <Label content={`${size} ${unit}`} icon='save' size='tiny' />
      <Label content={`${lastModified.toLocaleString()}`} icon='calendar check outline' size='tiny' />
    </div>
  );
};
