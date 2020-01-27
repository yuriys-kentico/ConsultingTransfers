import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Container, Table } from 'semantic-ui-react';

import { experience } from '../../../../appSettings.json';
import { useDependency } from '../../../../services/dependencyContainer';
import { IFile } from '../../../../services/models/IFile.js';
import { ITransferFilesService } from '../../../../services/TransferFilesService';
import { transfer } from '../../../../terms.en-us.json';
import { useSubscription } from '../../../../utilities/observables';
import { format } from '../../../../utilities/strings';
import { Tooltip } from '../../../shared/Tooltip';
import { MessageContext } from '../../header/MessageContext';
import { BlobDetails } from '../BlobDetails';
import { IFieldProps } from '../FieldHolder';

export const UploadFile: FC<IFieldProps> = ({
  name,
  completed,
  headingBlock,
  commentBlock,
  setFieldReady,
  setFieldCanBeCompleted
}) => {
  const { uploadFile } = transfer.fields;
  const { uploadExtensions } = experience;

  const messageContext = useContext(MessageContext);

  const transferFilesService = useDependency(ITransferFilesService);
  transferFilesService.messageContext = messageContext;

  const [ready, setReady] = useState(false);
  const [filesList, setFilesList] = useState<IFile[]>([]);

  const onDropAccepted = useCallback(
    async files => {
      setFieldReady(false);

      await transferFilesService.uploadFiles(files, name);

      setFieldCanBeCompleted(true);
      setFieldReady(true);
    },
    [name, setFieldReady, transferFilesService, setFieldCanBeCompleted]
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

  const files = useSubscription(transferFilesService.files);

  useEffect(() => {
    if (files) {
      const fieldFiles = transferFilesService.getFieldFiles(files, name);

      setFilesList(fieldFiles);

      if (fieldFiles.length > 0) {
        setFieldCanBeCompleted(true);
      } else {
        setFieldCanBeCompleted(false);
      }

      setReady(true);
    }
  }, [files, transferFilesService, name, setFieldCanBeCompleted]);

  return (
    <>
      {headingBlock()}
      {commentBlock()}
      <div
        {...getRootProps({
          className: `drop zone ${isDragActive ? 'active' : ''} ${completed ? 'disabled' : ''}`
        })}
      >
        <Container>
          {ready && (
            <Table unstackable singleLine basic='very' compact>
              <Table.Body>
                {filesList.map((file, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>
                      <BlobDetails file={file} />
                    </Table.Cell>
                    <Table.Cell textAlign='right'>
                      <Tooltip text={transfer.tooltips.deleteFile}>
                        <Button
                          onClick={event => {
                            event.stopPropagation();
                            transferFilesService.deleteFiles(file);
                          }}
                          disabled={completed}
                          inverted
                          icon='trash'
                          color='red'
                        />
                      </Tooltip>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Container>
        <input {...getInputProps()} />
        {!completed && (isDragActive ? uploadFile.active : uploadFile.passive)}
      </div>
    </>
  );
};
