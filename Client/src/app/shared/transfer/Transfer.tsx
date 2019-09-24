import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { lazy, useContext, useEffect, useRef, useState } from 'react';
import { AuthenticationState } from 'react-aad-msal';
import { Header, Loader, Segment } from 'semantic-ui-react';

import { azureStorage, terms } from '../../../appSettings.json';
import { AzureFunctions } from '../../../connectors/AzureFunctions';
import { AzureStorage, getContainerURL, IAzureStorageOptions } from '../../../connectors/AzureStorage';
import { deleteFrom } from '../../../utilities/arrays';
import { AuthenticatedContext } from '../../authenticated/AuthenticatedContext';
import { RoutedFC } from '../../RoutedFC';
import { AppHeaderContext } from '../header/AppHeaderContext';
import { Fields } from './Fields';
import { ITransferContext, TransferContext } from './TransferContext';

const Debug = lazy(() => import('../../authenticated/admin/Debug').then(module => ({ default: module.Debug })));

export interface ITransferProps {
  encodedContainerToken: string;
}

export const Transfer: RoutedFC<ITransferProps> = ({ encodedContainerToken }) => {
  const appHeaderContext = useContext(AppHeaderContext);
  const { authProvider } = useContext(AuthenticatedContext);

  const azureStorageOptions = useRef<IAzureStorageOptions>({
    appOptions: azureStorage,
    messageHandlers: appHeaderContext,
    containerUrl: null as any
  });

  const containerNameRef = useRef('');

  useEffect(() => {
    const containerToken = decodeURIComponent(encodedContainerToken || '');

    AzureFunctions.getTransfer(authProvider, containerToken, azureStorageOptions.current.messageHandlers).then(
      response => {
        if (response) {
          const { containerUrl, containerName, transfer } = response;

          containerNameRef.current = containerName;
          azureStorageOptions.current.containerUrl = getContainerURL(containerUrl);

          AzureStorage.listBlobs(azureStorageOptions.current).then(blobs =>
            setTransferContext(transferContext => ({
              ...transferContext,
              transfer,
              blobs: blobs || []
            }))
          );
        }
      }
    );
  }, [authProvider, encodedContainerToken, appHeaderContext]);

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

  const createContainer = (containerName: string) =>
    AzureStorage.createContainer(azureStorageOptions.current, containerName)
      .then(() => AzureStorage.listBlobs(azureStorageOptions.current))
      .then(blobs => blobs && setTransferContext(transferContext => ({ ...transferContext, blobs })));

  const deleteContainer = (containerName: string) =>
    AzureStorage.deleteContainer(azureStorageOptions.current, containerName).then(() =>
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
            <Debug containerName={containerNameRef.current} />
          )}
        </TransferContext.Provider>
      )}
    </Segment>
  );
};
