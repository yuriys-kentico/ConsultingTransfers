import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC, useCallback, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Container, Table } from 'semantic-ui-react';

import { experience } from '../../../../appSettings.json';
import { getFieldBlobs, getSafePathSegment } from '../../../../services/azureStorage/azureStorage';
import { IAzureStorageService } from '../../../../services/azureStorage/AzureStorageService';
import { useDependency } from '../../../../services/dependencyContainer';
import { transfer } from '../../../../terms.en-us.json';
import { useSubscription } from '../../../../utilities/observables';
import { format } from '../../../../utilities/strings';
import { MessageContext } from '../../header/MessageContext';
import { BlobDetails } from '../BlobDetails';
import { IFieldHolderProps } from '../FieldHolder';

export const UploadFile: FC<IFieldHolderProps> = ({ name, completed, setFieldLoading }) => {
  const { uploadFile } = transfer.fields;
  const { uploadExtensions } = experience;

  const azureStorageService = useDependency(IAzureStorageService);
  const messageContext = useContext(MessageContext);

  azureStorageService.messageContext = messageContext;

  const onDropAccepted = useCallback(
    async files => {
      setFieldLoading(true);

      await azureStorageService.uploadFiles(files, name);

      setFieldLoading(false);
    },
    [name, setFieldLoading, azureStorageService]
  );

  const onDropRejected = useCallback(
    async _ => {
      messageContext.showWarning({
        message: format(uploadFile.rejectedExtensions, uploadExtensions.map(ext => ext.toUpperCase()).join(', '))
      });
    },
    [messageContext, uploadExtensions, uploadFile.rejectedExtensions]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    onDropRejected,
    disabled: completed,
    accept: uploadExtensions
  });

  let fieldBlobs: BlobItem[] = [];

  const blobs = useSubscription(azureStorageService.blobs);

  if (blobs) {
    fieldBlobs = getFieldBlobs(blobs, name);
  }

  return (
    <div {...getRootProps({ className: `drop zone ${isDragActive ? 'active' : ''} ${completed ? 'disabled' : ''}` })}>
      <Container>
        <Table unstackable singleLine basic='very' compact>
          <Table.Body>
            {fieldBlobs.map((blob, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <BlobDetails file={blob} fileName={blob.name.split(`${getSafePathSegment(name)}/`)[1]} />
                </Table.Cell>
                <Table.Cell textAlign='right'>
                  <Button
                    onClick={event => {
                      event.stopPropagation();
                      azureStorageService.deleteBlobs(blob);
                    }}
                    disabled={completed}
                    icon='trash'
                    circular
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>
      <input {...getInputProps()} />
      {!completed && (isDragActive ? uploadFile.active : uploadFile.passive)}
    </div>
  );
};
