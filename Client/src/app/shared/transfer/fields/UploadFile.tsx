import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Container, List } from 'semantic-ui-react';

import { terms } from '../../../../appSettings.json';
import { getFieldBlobs, getSafePathSegment } from '../../../../connectors/AzureStorage';
import { IAzureStorageService } from '../../../../services/azureStorage/AzureStorageService';
import { useDependency } from '../../../../services/dependencyContainer';
import { BlobDetails } from '../BlobDetails';
import { IFieldHolderProps } from '../FieldHolder';
import { TransferContext } from '../TransferContext';

export const UploadFile: FC<IFieldHolderProps> = ({ name, completed, setFieldLoading }) => {
  const { uploadFile } = terms.shared.transfer.fields;

  const { uploadFiles } = useContext(TransferContext);

  const azureStorageService = useDependency(IAzureStorageService);

  const [blobsStream, setBlobsStream] = useState<BlobItem[]>([]);

  const onDrop = useCallback(
    async files => {
      setFieldLoading(true);

      await uploadFiles(files, name);

      setFieldLoading(false);
    },
    [name, setFieldLoading, uploadFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, disabled: completed });

  useEffect(() => {
    const sub = azureStorageService.blobs.subscribe({
      next: blobs => {
        setBlobsStream(blobs);
      }
    });

    return () => sub.unsubscribe();
  }, [azureStorageService.blobs]);

  const fieldBlobs = getFieldBlobs(blobsStream, name);

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
