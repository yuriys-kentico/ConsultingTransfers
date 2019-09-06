import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC } from 'react';
import { Header, Label } from 'semantic-ui-react';

import { toRounded } from '../../../utilities/numbers';

interface IBlobDetailsProps {
  file: BlobItem;
  fileName?: string;
}

const getSizeText = (sizeInBytes: number): string => {
  let finalSize = sizeInBytes;
  let unit = 'B';

  // Gigabytes
  if (sizeInBytes > 1024 * 1024 * 1024) {
    finalSize = sizeInBytes / 1024 / 1024 / 1024;
    unit = 'GB';
  }
  // Megabytes
  else if (sizeInBytes > 1024 * 1024) {
    finalSize = sizeInBytes / 1024 / 1024;
    unit = 'MB';
  }
  // Kilobytes
  else if (sizeInBytes > 1024) {
    finalSize = sizeInBytes / 1024;
    unit = 'KB';
  }

  return `${toRounded(finalSize)} ${unit}`;
};

export const BlobDetails: FC<IBlobDetailsProps> = ({ file, fileName }) => {
  const { contentLength, lastModified } = file.properties;

  return (
    <div>
      <Header as='h5' sub content={fileName ? fileName : file.name} />
      {<Label content={contentLength !== undefined && getSizeText(contentLength)} icon='save' size='tiny' />}
      <Label content={`${lastModified.toLocaleString()}`} icon='calendar check outline' size='tiny' />
    </div>
  );
};
