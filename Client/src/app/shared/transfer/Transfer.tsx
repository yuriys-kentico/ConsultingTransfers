import { ContainerURL } from '@azure/storage-blob';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import Axios, { AxiosResponse } from 'axios';
import React, { lazy, useContext, useEffect, useRef, useState } from 'react';
import { AuthenticationState } from 'react-aad-msal';
import { Header, Loader, Segment } from 'semantic-ui-react';

import { AzureStorage, getContainerURL, IAzureStorageOptions } from '../../../connectors/azure/azureStorage';
import { IRequestRetrieverResponse } from '../../../connectors/azure/requests';
import { deleteFrom } from '../../../utilities/arrays';
import { getAuthorizationHeaders } from '../../../utilities/requests';
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
    const { accountName, requestRetriever, accountPermissions, containerPermissions } = azureStorage;

    const containerToken = decodeURIComponent(encodedContainerToken || '');

    const setTransferContextFromRetriever = (response: AxiosResponse<IRequestRetrieverResponse>) => {
      const { sasToken, containerName, requestItem } = response.data;
      const containerURL = getContainerURL(accountName, containerName, sasToken);

      AzureStorage.listBlobs(containerURL, azureStorageOptions.current).then(blobs => {
        setTransferContext(transferContext => ({
          ...transferContext,
          requestItem,
          blobs: blobs || [],
          containerName,
          containerURL
        }));
      });
    };

    if (authProvider) {
      authProvider.getAccessToken().then(({ accessToken }) => {
        const request = {
          accountName,
          accountPermissions,
          containerToken
        };

        Axios.post<IRequestRetrieverResponse>(
          requestRetriever.endpoint,
          request,
          getAuthorizationHeaders(requestRetriever.key, accessToken)
        ).then(setTransferContextFromRetriever);
      });
    } else {
      const request = {
        accountName,
        containerPermissions,
        containerToken
      };

      Axios.post<IRequestRetrieverResponse>(
        requestRetriever.endpoint,
        request,
        getAuthorizationHeaders(requestRetriever.key)
      ).then(setTransferContextFromRetriever);
    }
  }, [authProvider, encodedContainerToken, azureStorage]);

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
