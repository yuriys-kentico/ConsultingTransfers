import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { Button, List, Placeholder, Segment } from 'semantic-ui-react';
import { AppHeaderContext } from '../../header/AppHeaderContext';
import { getFiles, uploadFiles, useContainer } from '../azure/azureStorage';
import { BlobDetails } from '../BlobDetails';
import { IFieldProps } from '../Fields';
import { TransferContext } from '../TransferContext';

export const UploadFile: FC<IFieldProps> = ({ field }) => {
  const appHeaderContext = useContext(AppHeaderContext);
  const { item } = useContext(TransferContext);

  const { containerURL } = useContainer(item.system.codename);

  const [files, setFiles] = useState<BlobItem[]>();

  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getFiles(containerURL, appHeaderContext, field.system.codename).then(files => setFiles(files));
  }, [field.system.codename]);

  return (
    <List.Item>
      <Segment>
        <List.Content floated='right'>
          <Button onClick={() => fileInput.current && fileInput.current.click()} content={`${field.system.name}`} />
        </List.Content>
        {!files ? (
          <Placeholder>
            <Placeholder.Header>
              <Placeholder.Line />
              <Placeholder.Line />
            </Placeholder.Header>
          </Placeholder>
        ) : (
          files.map((file, index) => (
            <List.Content key={index} className='padding bottom'>
              <BlobDetails file={file} />
            </List.Content>
          ))
        )}
        <input
          type='file'
          ref={fileInput}
          onChange={() => {
            fileInput.current && uploadFiles(fileInput.current, containerURL, field.system.codename, appHeaderContext);
          }}
          multiple
          style={{ display: 'none' }}
        />
      </Segment>
    </List.Item>
  );
};
