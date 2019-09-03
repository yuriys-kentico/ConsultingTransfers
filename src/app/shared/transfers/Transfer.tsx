import { ContainerURL } from '@azure/storage-blob';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import { ItemResponses } from 'kentico-cloud-delivery';
import React, { useContext, useEffect, useState } from 'react';
import { Header, Segment } from 'semantic-ui-react';

import { deleteFrom } from '../../../utilities/arrays';
import { AppContext } from '../../AppContext';
import { AdminControls } from '../../authenticated/admin/AdminControls';
import { RoutedFC } from '../../RoutedFC';
import { AppHeaderContext } from '../header/AppHeaderContext';
import { AzureStorage, getContainerURL, getSafeStorageName } from './azure/azureStorage';
import { IAzureStorageOptions } from './azure/IAzureStorageOptions';
import { Fields } from './Fields';
import { ConsultingRequest } from './kenticoCloud/ConsultingRequest';
import { getDeliveryClient } from './kenticoCloud/kenticoCloud';
import { Loading } from './Loading';
import { ITransferContext, TransferContext } from './TransferContext';

export interface ITransferProps {
  urlSlug: string;
  authenticated: boolean;
}

export const Transfer: RoutedFC<ITransferProps> = props => {
  const appContext = useContext(AppContext);
  const appHeaderContext = useContext(AppHeaderContext);

  const azureStorageOptions: IAzureStorageOptions = {
    appOptions: appContext.azureStorage,
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

  const uploadFiles = (files: FileList, directory: string, containerURL: ContainerURL) =>
    AzureStorage.uploadFiles(files, directory, containerURL, azureStorageOptions)
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
    request: new ConsultingRequest(),
    blobs: [],
    deleteBlobs,
    downloadBlob,
    uploadFiles,
    createContainer,
    deleteContainer
  });

  useEffect(() => {
    if (props.urlSlug) {
      const deliveryClient = getDeliveryClient({ ...appContext.kenticoCloud });

      deliveryClient
        .items<ConsultingRequest>()
        .type('consulting_request')
        .equalsFilter('elements.url', props.urlSlug)
        .toObservable()
        .subscribe(setItemFromResponse);
    }
  }, [props.urlSlug]);

  const setItemFromResponse = (response: ItemResponses.ListContentItemsResponse<ConsultingRequest>) => {
    const item = response.items[0];

    const safeContainerName = getSafeStorageName(item.system.codename);

    const accountName = appContext.azureStorage.accountName;
    const sasString = appContext.azureStorage.sasToken;

    const containerURL = getContainerURL(accountName, safeContainerName, sasString);

    AzureStorage.listBlobs(containerURL, azureStorageOptions).then(blobs => {
      blobs && setTransferContext(transferContext => ({ ...transferContext, request: item, blobs }));
    });
  };

  return (
    <Segment basic>
      {!transferContext.request.system ? (
        <Loading />
      ) : (
        <TransferContext.Provider value={transferContext}>
          <div>
            <Header as='h2' content={`${appContext.terms.transferLabel} ${transferContext.request.system.name}`} />
            <Fields />
            {props.authenticated && <AdminControls />}
          </div>
        </TransferContext.Provider>
      )}
    </Segment>
  );
};
