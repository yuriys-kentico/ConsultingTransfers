import React, { FC, useCallback, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { Container, List } from 'semantic-ui-react';

import { useContainer } from '../../../../connectors/azure/azureStorage';
import { AppContext } from '../../../AppContext';
import { BlobDetails } from '../BlobDetails';
import { IFieldProps } from '../Fields';
import { TransferContext } from '../TransferContext';

export const UploadFile: FC<IFieldProps> = ({ name, comment }) => {
  const {
    terms: {
      shared: {
        transfer: {
          fields: { uploadFile }
        }
      }
    }
  } = useContext(AppContext);
  const { request, blobs, uploadFiles } = useContext(TransferContext);
  const { containerURL } = useContainer(request.system.codename);

  const onDrop = useCallback(files => {
    uploadFiles(files, name, containerURL);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const fieldBlobs = blobs.filter(blob => blob.name.startsWith(`${name}/`));

  return (
    <div {...getRootProps({ className: isDragActive ? 'drop zone active' : 'drop zone' })}>
      <Container>
        {fieldBlobs.map((file, index) => (
          <List.Content key={index} className='padding bottom'>
            <BlobDetails file={file} fileName={file.name.split(`${name}/`)[1]} />
          </List.Content>
        ))}
      </Container>
      <input {...getInputProps()} />
      {isDragActive ? uploadFile.active : uploadFile.passive}
    </div>
  );
};
