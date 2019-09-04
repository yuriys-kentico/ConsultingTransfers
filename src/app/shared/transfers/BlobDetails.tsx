import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC } from 'react';
import { Label, List } from 'semantic-ui-react';

import { toRounded } from '../../../utilities/numbers';

interface IBlobDetailsProps {
  file: BlobItem;
  fileName?: string;
}

export const BlobDetails: FC<IBlobDetailsProps> = ({ file, fileName }) => {
  const { contentLength, lastModified } = file.properties;

  return (
    <div>
      <List.Header>{fileName ? fileName : file.name}</List.Header>
      <List.Description>
        {contentLength && <Label content={`${toRounded(contentLength / 1024 / 1024, 2)} MB`} icon='save' size='tiny' />}
        <Label content={`${lastModified.toLocaleString()}`} icon='calendar check outline' size='tiny' />
      </List.Description>
    </div>
  );
};
