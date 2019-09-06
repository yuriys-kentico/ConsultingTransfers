import React, { FC, useCallback, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { Container, List } from 'semantic-ui-react';

import { getFieldBlobs, useContainer } from '../../../../connectors/azure/azureStorage';
import { AppContext } from '../../../AppContext';
import { BlobDetails } from '../BlobDetails';
import { IFieldHolderProps } from '../FieldHolder';
import { TransferContext } from '../TransferContext';

export const UploadFile: FC<IFieldHolderProps> = ({ field, completed }) => {
  const name = field.name.value;

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, disabled: completed });

  const fieldBlobs = getFieldBlobs(blobs, name);

  const getClassName = ['drop zone', isDragActive ? 'active' : '', completed ? 'disabled' : ''].join(' ');

  return (
    <div {...getRootProps({ className: getClassName })}>
      <Container>
        {fieldBlobs.map((file, index) => (
          <List.Content key={index} className='padding bottom'>
            <BlobDetails file={file} fileName={file.name.split(`${name}/`)[1]} />
          </List.Content>
        ))}
      </Container>
      <input {...getInputProps()} />
      {!completed && (isDragActive ? uploadFile.active : uploadFile.passive)}
    </div>
  );
};
