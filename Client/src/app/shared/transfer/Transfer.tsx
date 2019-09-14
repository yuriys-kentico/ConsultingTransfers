import { ContainerURL } from '@azure/storage-blob';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import Axios, { AxiosResponse } from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { AuthenticationState } from 'react-aad-msal';
import { Header, Loader, Segment } from 'semantic-ui-react';

import { AzureStorage, getContainerURL, IAzureStorageOptions } from '../../../connectors/azure/azureStorage';
import { IRequestRetrieverResponse } from '../../../connectors/azureFunctions/RequestRetriever';
import { deleteFrom } from '../../../utilities/arrays';
import { AppContext } from '../../AppContext';
import { AdminControls } from '../../authenticated/admin/AdminControls';
import { AuthenticatedContext } from '../../authenticated/AuthenticatedContext';
import { RoutedFC } from '../../RoutedFC';
import { AppHeaderContext } from '../header/AppHeaderContext';
import { Fields } from './Fields';
import { ITransferContext, TransferContext } from './TransferContext';

export interface ITransferProps {
  containerToken: string;
}

export const Transfer: RoutedFC<ITransferProps> = ({ containerToken }) => {
  const { azureStorage, terms } = useContext(AppContext);
  const appHeaderContext = useContext(AppHeaderContext);
  const { authProvider } = useContext(AuthenticatedContext);

  const { accountName, requestRetrieverEndpoint, accountPermissions, containerPermissions } = azureStorage;

  const setTransferContextFromRetriever = (response: AxiosResponse<IRequestRetrieverResponse>) => {
    const { sasToken, containerName, requestItem } = response.data;
    const containerURL = getContainerURL(accountName, containerName, sasToken);

    AzureStorage.listBlobs(containerURL, azureStorageOptions).then(blobs => {
      setTransferContext(transferContext => ({
        ...transferContext,
        requestItem,
        blobs: blobs || [],
        containerName,
        containerURL
      }));
    });
  };

  useEffect(() => {
    if (authProvider) {
      authProvider.getAccessToken().then(response => {
        const request = {
          accountName,
          accessToken: response.accessToken,
          accountPermissions,
          containerToken
        };

        Axios.post<IRequestRetrieverResponse>(requestRetrieverEndpoint, request).then(setTransferContextFromRetriever);
      });
    } else {
      const request = {
        accountName,
        containerPermissions,
        containerToken
      };

      Axios.post<IRequestRetrieverResponse>(requestRetrieverEndpoint, request).then(setTransferContextFromRetriever);
    }
  }, []);

  const azureStorageOptions: IAzureStorageOptions = {
    appOptions: azureStorage,
    messageHandlers: appHeaderContext
  };

  const deleteBlobs = (blobs: BlobItem[] | BlobItem, containerURL: ContainerURL) =>
    AzureStorage.deleteBlobs(blobs, containerURL, azureStorageOptions).then(() =>
      setTransferContext(transferContext => {
        return { ...transferContext, blobs: deleteFrom(blobs, transferContext.blobs) };
      })
    );

  const downloadBlob = (blob: BlobItem, containerURL: ContainerURL) =>
    AzureStorage.downloadBlob(blob, containerURL, azureStorageOptions);

  const readBlobString = (blob: BlobItem, containerURL: ContainerURL) =>
    AzureStorage.readBlobString(blob, containerURL, azureStorageOptions);

  const uploadFiles = (files: File[] | File, directory: string, containerURL: ContainerURL, silent?: boolean) =>
    AzureStorage.uploadFiles(files, directory, containerURL, azureStorageOptions, silent)
      .then(() => AzureStorage.listBlobs(containerURL, azureStorageOptions))
      .then(blobs => {
        blobs && setTransferContext(transferContext => ({ ...transferContext, blobs }));
      });

  const createContainer = (containerName: string, containerURL: ContainerURL) =>
    AzureStorage.createContainer(containerName, containerURL, azureStorageOptions)
      .then(() => AzureStorage.listBlobs(containerURL, azureStorageOptions))
      .then(blobs => {
        blobs && setTransferContext(transferContext => ({ ...transferContext, blobs }));
      });

  const deleteContainer = (containerName: string, containerURL: ContainerURL) =>
    AzureStorage.deleteContainer(containerName, containerURL, azureStorageOptions).then(() =>
      setTransferContext(transferContext => ({ ...transferContext, blobs: [] }))
    );

  const [transferContext, setTransferContext] = useState<ITransferContext>({
    containerName: '',
    containerURL: null as any,
    requestItem: null as any,
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
      {!transferContext.requestItem ? (
        <Loader active size='massive' />
      ) : (
        <TransferContext.Provider value={transferContext}>
          <Header as='h2' content={`${terms.shared.transfer.header} ${transferContext.requestItem.system.name}`} />
          <Fields />
          {authProvider && authProvider.authenticationState === AuthenticationState.Authenticated && <AdminControls />}
        </TransferContext.Provider>
      )}
    </Segment>
  );
};
