import { ContainerURL } from '@azure/storage-blob';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { lazy, useContext, useEffect, useRef, useState } from 'react';
import { AuthenticationState } from 'react-aad-msal';
import { Header, Loader, Segment } from 'semantic-ui-react';

import { AzureFunctions } from '../../../connectors/azure/AzureFunctions';
import { AzureStorage, getContainerURL, IAzureStorageOptions } from '../../../connectors/azure/AzureStorage';
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
    messageHandlers: appHeaderContext
  });

  useEffect(() => {
    const { accountName, getTransfer } = azureStorage;

    const containerToken = decodeURIComponent(encodedContainerToken || '');

    AzureFunctions.getTransfer(accountName, getTransfer, authProvider, containerToken, appHeaderContext).then(
      response => {
        if (response) {
          const { sasToken, containerName, transfer } = response;
          const containerURL = getContainerURL(accountName, containerName, sasToken);

          AzureStorage.listBlobs(containerURL, azureStorageOptions.current).then(blobs =>
            setTransferContext(transferContext => ({
              ...transferContext,
              transfer,
              blobs: blobs || [],
              containerName,
              containerURL
            }))
          );
        }
      }
    );
  }, [authProvider, encodedContainerToken, azureStorage, appHeaderContext]);

  const deleteBlobs = (blobs: BlobItem[] | BlobItem, containerURL: ContainerURL) =>
    AzureStorage.deleteBlobs(blobs, containerURL, azureStorageOptions.current).then(() =>
      setTransferContext(transferContext => {
        return { ...transferContext, blobs: deleteFrom(blobs, transferContext.blobs) };
      })
    );

  const downloadBlob = (blob: BlobItem, containerURL: ContainerURL) =>
    AzureStorage.downloadBlob(blob, containerURL, azureStorageOptions.current);

  const readBlobString = (blob: BlobItem, containerURL: ContainerURL) =>
    AzureStorage.readBlobString(blob, containerURL, azureStorageOptions.current);

  const uploadFiles = (files: File[] | File, directory: string, containerURL: ContainerURL, silent?: boolean) =>
    AzureStorage.uploadFiles(files, directory, containerURL, azureStorageOptions.current, silent)
      .then(() => AzureStorage.listBlobs(containerURL, azureStorageOptions.current))
      .then(blobs => {
        blobs && setTransferContext(transferContext => ({ ...transferContext, blobs }));
      });

  const createContainer = (containerName: string, containerURL: ContainerURL) =>
    AzureStorage.createContainer(containerName, containerURL, azureStorageOptions.current)
      .then(() => AzureStorage.listBlobs(containerURL, azureStorageOptions.current))
      .then(blobs => {
        blobs && setTransferContext(transferContext => ({ ...transferContext, blobs }));
      });

  const deleteContainer = (containerName: string, containerURL: ContainerURL) =>
    AzureStorage.deleteContainer(containerName, containerURL, azureStorageOptions.current).then(() =>
      setTransferContext(transferContext => ({ ...transferContext, blobs: [] }))
    );

  const [transferContext, setTransferContext] = useState<ITransferContext>({
    containerName: '',
    containerURL: null as any,
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
          {authProvider && authProvider.authenticationState === AuthenticationState.Authenticated && <AdminControls />}
        </TransferContext.Provider>
      )}
    </Segment>
  );
};
