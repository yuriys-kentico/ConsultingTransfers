import React, { FC, useCallback, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { Container, Header, List, Segment } from 'semantic-ui-react';

import { AppContext } from '../../../AppContext';
import { getSafeStorageName, useContainer } from '../azure/azureStorage';
import { BlobDetails } from '../BlobDetails';
import { IFieldProps } from '../Fields';
import { TransferContext } from '../TransferContext';

export const UploadFile: FC<IFieldProps> = ({ field }) => {
  const { terms } = useContext(AppContext);
  const { request, blobs, uploadFiles } = useContext(TransferContext);
  const { containerURL } = useContainer(request.system.codename);

  const onDrop = useCallback(files => {
    uploadFiles(files, field.system.codename, containerURL);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const fieldBlobs = blobs.filter(blob => !blob.name.startsWith(`${getSafeStorageName(field.system.name)}/`));

  return (
    <List.Item>
      <Segment>
        <Header as='h4' content={`${field.system.name}`} />
        <div {...getRootProps({ className: isDragActive ? 'drop zone active' : 'drop zone' })}>
          <Container>
            {fieldBlobs.map((file, index) => (
              <List.Content key={index} className='padding bottom'>
                <BlobDetails
                  file={file}
                  fileName={file.name.split(`${getSafeStorageName(field.system.codename)}/`)[1]}
                />
              </List.Content>
            ))}
          </Container>
          <input {...getInputProps()} />
          {isDragActive ? terms.dropZoneActive : terms.dropZonePassive}
        </div>
      </Segment>
    </List.Item>
  );
};
