import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { lazy, useContext, useEffect, useRef, useState } from 'react';
import { AuthenticationState } from 'react-aad-msal';
import { Header, Loader, Segment } from 'semantic-ui-react';

import { azureStorage, terms } from '../../../appSettings.json';
import { AzureFunctions } from '../../../connectors/AzureFunctions';
import { getContainerURL, IAzureStorageOptions } from '../../../connectors/AzureStorage';
import { IAzureStorageService } from '../../../services/azureStorage/AzureStorageService';
import { useDependency } from '../../../services/dependencyContainer';
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
  const messageHandlers = useContext(AppHeaderContext);
  const { authProvider } = useContext(AuthenticatedContext);

  const azureStorageOptions = useRef<IAzureStorageOptions>({
    appOptions: azureStorage,
    messageHandlers,
    containerUrl: null as any
  });

  const azureStorageService = useDependency(IAzureStorageService);

  useEffect(() => {
    const containerToken = decodeURIComponent(encodedContainerToken || '');

    AzureFunctions.getTransfer(authProvider, containerToken, azureStorageOptions.current.messageHandlers).then(
      response => {
        if (response) {
          const { containerUrl, containerName, transfer } = response;

          azureStorageOptions.current.containerUrl = getContainerURL(containerUrl);

          azureStorageService.containerUrl = getContainerURL(containerUrl);
          azureStorageService.containerName = containerName;
          azureStorageService.listBlobsSubject(messageHandlers);

          setTransferContext(transferContext => ({
            ...transferContext,
            transfer
          }));
        }
      }
    );
  }, [authProvider, encodedContainerToken, messageHandlers, azureStorageService]);

  const deleteBlobs = (blobs: BlobItem[] | BlobItem) =>
    azureStorageService
      .deleteBlobs(blobs, azureStorageOptions.current)
      .then(() =>
        setTransferContext(transferContext => ({ ...transferContext, blobs: deleteFrom(blobs, transferContext.blobs) }))
      );

  const downloadBlob = (blob: BlobItem) => azureStorageService.downloadBlob(blob, azureStorageOptions.current);

  const readBlobString = (blob: BlobItem) => azureStorageService.readBlobString(blob, azureStorageOptions.current);

  const uploadFiles = (files: File[] | File, directory: string, silent?: boolean) =>
    azureStorageService
      .uploadFiles(files, directory, azureStorageOptions.current, silent)
      .then(() => azureStorageService.listBlobs(azureStorageOptions.current))
      .then(blobs => blobs && setTransferContext(transferContext => ({ ...transferContext, blobs })));

  const createContainer = (containerName: string) =>
    azureStorageService
      .createContainer(azureStorageOptions.current, containerName)
      .then(() => azureStorageService.listBlobs(azureStorageOptions.current))
      .then(blobs => blobs && setTransferContext(transferContext => ({ ...transferContext, blobs })));

  const deleteContainer = (containerName: string) =>
    azureStorageService
      .deleteContainer(azureStorageOptions.current, containerName)
      .then(() => setTransferContext(transferContext => ({ ...transferContext, blobs: [] })));

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
            <Debug containerName={azureStorageService.containerName} />
          )}
        </TransferContext.Provider>
      )}
    </Segment>
  );
};
