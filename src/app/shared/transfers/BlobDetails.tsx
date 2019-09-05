import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC } from 'react';
import { Header, Label } from 'semantic-ui-react';

import { toRounded } from '../../../utilities/numbers';

interface IBlobDetailsProps {
  file: BlobItem;
  fileName?: string;
}

export const BlobDetails: FC<IBlobDetailsProps> = ({ file, fileName }) => {
  const { contentLength, lastModified } = file.properties;

  return (
    <div>
      <Header as='h5' sub content={fileName ? fileName : file.name} />
      {contentLength && <Label content={`${toRounded(contentLength / 1024 / 1024, 2)} MB`} icon='save' size='tiny' />}
      <Label content={`${lastModified.toLocaleString()}`} icon='calendar check outline' size='tiny' />
    </div>
  );
};
