import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC, useCallback, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { Container, List } from 'semantic-ui-react';

import { terms } from '../../../../appSettings.json';
import { getFieldBlobs, getSafePathSegment } from '../../../../services/azureStorage/azureStorage';
import { IAzureStorageService } from '../../../../services/azureStorage/AzureStorageService';
import { useDependency } from '../../../../services/dependencyContainer';
import { useSubscription } from '../../../../utilities/observables';
import { MessageContext } from '../../header/MessageContext';
import { BlobDetails } from '../BlobDetails';
import { IFieldHolderProps } from '../FieldHolder';

export const UploadFile: FC<IFieldHolderProps> = ({ name, completed, setFieldLoading }) => {
  const { uploadFile } = terms.shared.transfer.fields;

  const azureStorageService = useDependency(IAzureStorageService);
  azureStorageService.messageHandlers = useContext(MessageContext);

  const onDrop = useCallback(
    async files => {
      setFieldLoading(true);

      await azureStorageService.uploadFiles(files, name);

      setFieldLoading(false);
    },
    [name, setFieldLoading, azureStorageService]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, disabled: completed });

  let fieldBlobs: BlobItem[] = [];

  const blobs = useSubscription(azureStorageService.blobs);

  if (blobs) {
    fieldBlobs = getFieldBlobs(blobs, name);
  }

  const getClassName = ['drop zone', isDragActive ? 'active' : '', completed ? 'disabled' : ''].join(' ');

  return (
    <div {...getRootProps({ className: getClassName })}>
      <Container>
        {fieldBlobs.map((file, index) => (
          <List.Content key={index} className='padding bottom'>
            <BlobDetails file={file} fileName={file.name.split(`${getSafePathSegment(name)}/`)[1]} />
          </List.Content>
        ))}
      </Container>
      <input {...getInputProps()} />
      {!completed && (isDragActive ? uploadFile.active : uploadFile.passive)}
    </div>
  );
};
