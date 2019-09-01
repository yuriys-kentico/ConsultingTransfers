import { FC, useContext, useRef, useState, useEffect } from 'react';
import React from 'react';
import { useContainer, uploadFiles, getFiles, getSafeStorageName } from '../azure/azureStorage';
import { AppHeaderContext } from '../../header/AppHeaderContext';
import { Button, List, Label, Placeholder, Divider } from 'semantic-ui-react';
import { TransferContext } from '../TransferContext';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import { toRounded } from '../../../utilities/numbers';
import { IFieldProps } from '../Fields';

export const UploadFile: FC<IFieldProps> = ({ field }) => {
  const appHeaderContext = useContext(AppHeaderContext);
  const { item } = useContext(TransferContext);

  const fileInput = useRef<HTMLInputElement>(null);

  const { containerURL } = useContainer(item.system.codename);

  const [uploadedFiles, setUploadedFiles] = useState<BlobItem[]>();

  useEffect(() => {
    getFiles(containerURL, field.system.codename, appHeaderContext).then(files => setUploadedFiles(files));
  });

  return (
    <List.Item>
      <List.Content floated='right'>
        <Button onClick={() => fileInput.current && fileInput.current.click()} content={`${field.system.name}`} />
      </List.Content>
      {!uploadedFiles ? (
        <Placeholder>
          <Placeholder.Header>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
        </Placeholder>
      ) : (
        uploadedFiles.map((uploadedFile, index) => (
          <List.Content key={index} className='padding bottom'>
            <List.Header>{uploadedFile.name.split(`${getSafeStorageName(field.system.codename)}/`)[1]}</List.Header>
            {uploadedFile.properties.contentLength && (
              <List.Description>
                {uploadedFile.properties.contentLength > 0 && (
                  <Label
                    content={`${toRounded(uploadedFile.properties.contentLength / 1024 / 1024, 2)} MB`}
                    icon='save'
                    size='tiny'
                  />
                )}
                <Label
                  content={`${uploadedFile.properties.lastModified.toLocaleString()}`}
                  icon='calendar check outline'
                  size='tiny'
                />
              </List.Description>
                )}
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
    </List.Item>
  );
};
