import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { lazy, useContext, useEffect, useRef, useState } from 'react';
import { AuthenticationState } from 'react-aad-msal';
import { Header, Loader, Segment } from 'semantic-ui-react';

import { AzureFunctions } from '../../../connectors/AzureFunctions';
import { AzureStorage, getContainerURL, IAzureStorageOptions } from '../../../connectors/AzureStorage';
import { deleteFrom } from '../../../utilities/arrays';
import { AppContext } from '../../AppContext';
import { AuthenticatedContext } from '../../authenticated/AuthenticatedContext';
import { RoutedFC } from '../../RoutedFC';
import { AppHeaderContext } from '../header/AppHeaderContext';
import { Fields } from './Fields';
import { ITransferContext, TransferContext } from './TransferContext';

const AdminControls = lazy(() =>
  import('../../authenticated/admin/AdminControls').then(module => ({ default: module.AdminControls }))
);

export interface ITransferProps {
  encodedContainerToken: string;
}

export const Transfer: RoutedFC<ITransferProps> = ({ encodedContainerToken }) => {
  const { azureStorage, terms } = useContext(AppContext);
  const appHeaderContext = useContext(AppHeaderContext);
  const { authProvider } = useContext(AuthenticatedContext);

  const azureStorageOptions = useRef<IAzureStorageOptions>({
    appOptions: azureStorage,
    messageHandlers: appHeaderContext,
    containerName: '',
    containerUrl: null as any
  });

  useEffect(() => {
    const { accountName, getTransfer } = azureStorage;

    const containerToken = decodeURIComponent(encodedContainerToken || '');

    AzureFunctions.getTransfer(
      accountName,
      getTransfer,
      authProvider,
      containerToken,
      azureStorageOptions.current.messageHandlers
    ).then(response => {
      if (response) {
        const { sasToken, containerName, transfer } = response;

        azureStorageOptions.current.containerName = containerName;
        azureStorageOptions.current.containerUrl = getContainerURL(accountName, containerName, sasToken);

        AzureStorage.listBlobs(azureStorageOptions.current).then(blobs =>
          setTransferContext(transferContext => ({
            ...transferContext,
            transfer,
            blobs: blobs || []
          }))
        );
      }
    });
  }, [authProvider, encodedContainerToken, azureStorage, appHeaderContext]);

  const deleteBlobs = (blobs: BlobItem[] | BlobItem) =>
    AzureStorage.deleteBlobs(blobs, azureStorageOptions.current).then(() =>
      setTransferContext(transferContext => ({ ...transferContext, blobs: deleteFrom(blobs, transferContext.blobs) }))
    );

  const downloadBlob = (blob: BlobItem) => AzureStorage.downloadBlob(blob, azureStorageOptions.current);

  const readBlobString = (blob: BlobItem) => AzureStorage.readBlobString(blob, azureStorageOptions.current);

  const uploadFiles = (files: File[] | File, directory: string, silent?: boolean) =>
    AzureStorage.uploadFiles(files, directory, azureStorageOptions.current, silent)
      .then(() => AzureStorage.listBlobs(azureStorageOptions.current))
      .then(blobs => blobs && setTransferContext(transferContext => ({ ...transferContext, blobs })));

  const createContainer = () =>
    AzureStorage.createContainer(azureStorageOptions.current)
      .then(() => AzureStorage.listBlobs(azureStorageOptions.current))
      .then(blobs => blobs && setTransferContext(transferContext => ({ ...transferContext, blobs })));

  const deleteContainer = () =>
    AzureStorage.deleteContainer(azureStorageOptions.current).then(() =>
      setTransferContext(transferContext => ({ ...transferContext, blobs: [] }))
    );

  const [transferContext, setTransferContext] = useState<ITransferContext>({
    transfer: null as any,
    blobs: [],
    deleteBlobs,
    downloadBlob,
    readBlobString,
    uploadFiles,
    createContainer,
    deleteContainer
  });

  return (
    <Segment basic>
      {!transferContext.transfer ? (
        <Loader active size='massive' />
      ) : (
        <TransferContext.Provider value={transferContext}>
          <Header as='h2' content={`${terms.shared.transfer.header} ${transferContext.transfer.system.name}`} />
          <Fields />
          {authProvider && authProvider.authenticationState === AuthenticationState.Authenticated && (
            <AdminControls azureStorageOptions={azureStorageOptions.current} />
          )}
        </TransferContext.Provider>
      )}
    </Segment>
  );
};
