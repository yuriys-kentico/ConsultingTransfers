import { ContainerURL } from '@azure/storage-blob';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import Axios from 'axios';
import { ItemResponses } from 'kentico-cloud-delivery';
import React, { useContext, useEffect, useState } from 'react';
import { Header, Segment } from 'semantic-ui-react';

import {
    AzureStorage,
    getContainerURL,
    getSafeStorageName,
    IAzureSasTokenRequest,
    IAzureStorageOptions,
} from '../../../connectors/azure/azureStorage';
import { Field } from '../../../connectors/kenticoCloud/contentTypes/Field';
import { Request } from '../../../connectors/kenticoCloud/contentTypes/Request';
import { KenticoCloud } from '../../../connectors/kenticoCloud/kenticoCloud';
import { deleteFrom } from '../../../utilities/arrays';
import { AppContext } from '../../AppContext';
import { AdminControls } from '../../authenticated/admin/AdminControls';
import { RoutedFC } from '../../RoutedFC';
import { AppHeaderContext } from '../header/AppHeaderContext';
import { Fields } from './Fields';
import { ITransferContext, TransferContext } from './TransferContext';

export interface ITransferProps {
  urlSlug: string;
  authenticated: boolean;
}

export const Transfer: RoutedFC<ITransferProps> = ({ urlSlug, authenticated }) => {
  const { azureStorage, kenticoCloud, terms } = useContext(AppContext);
  const appHeaderContext = useContext(AppHeaderContext);

  useEffect(() => {
    if (urlSlug) {
      const deliveryClient = KenticoCloud.deliveryClient({ ...kenticoCloud.deliveryClient });

      deliveryClient
        .items<Request>()
        .type(Request.codename)
        .equalsFilter('elements.url', urlSlug)
        .toObservable()
        .subscribe(setContextFromResponse);
    }
  }, [urlSlug]);

  const setContextFromResponse = (response: ItemResponses.ListContentItemsResponse<Request>) => {
    const item = response.items[0];

    const containerName = getSafeStorageName(item.system.codename);
    const { accountName, sasTokenGeneratorEndpoint, accountPermissions, containerPermissions } = azureStorage;

    let request: IAzureSasTokenRequest;

    if (authenticated) {
      request = {
        accountName,
        accountPermissions
      };
    } else {
      request = {
        accountName,
        containerName,
        containerPermissions
      };
    }

    Axios.post<string>(sasTokenGeneratorEndpoint, request).then(response => {
      const sasToken = response.data;
      const containerURL = getContainerURL(accountName, containerName, sasToken);

      AzureStorage.listBlobs(containerURL, azureStorageOptions).then(blobs => {
        setTransferContext(transferContext => ({
          ...transferContext,
          request: item,
          blobs: blobs || [],
          containerName,
          containerURL
        }));
      });
    });
  };

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

  const updateCompletedField = (request: Request, field: Field) => {
    const contentManagementClient = KenticoCloud.contentManagementClient({ ...kenticoCloud.contentManagementClient });

    return contentManagementClient
      .upsertLanguageVariant()
      .byItemCodename(field.system.codename)
      .byLanguageCodename(field.system.language)
      .withElementCodenames([{ codename: 'completed', value: [{ codename: 'true' }] }])
      .toPromise();
  };

  const [transferContext, setTransferContext] = useState<ITransferContext>({
    containerName: '',
    containerURL: null as any,
    request: new Request(),
    blobs: [],
    deleteBlobs,
    downloadBlob,
    readBlobString,
    uploadFiles,
    createContainer,
    deleteContainer,
    updateCompletedField
  });

  return (
    <Segment basic>
      {!transferContext.request.system ? null : (
        <TransferContext.Provider value={transferContext}>
          <Header as='h2' content={`${terms.shared.transfer.header} ${transferContext.request.system.name}`} />
          <Fields />
          {authenticated && <AdminControls />}
        </TransferContext.Provider>
      )}
    </Segment>
  );
};
