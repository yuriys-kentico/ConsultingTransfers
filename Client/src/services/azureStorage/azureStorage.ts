import { AnonymousCredential, ContainerURL, StorageURL } from '@azure/storage-blob';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';

import { IMessageHandlers } from '../../app/frontend/header/MessageContext';

interface IAzureStorageAppOptions {
  uploadBlockMb: number;
  parallelism: number;
}

export interface IAzureStorageOptions {
  appOptions: IAzureStorageAppOptions;
  messageHandlers: IMessageHandlers;
  containerUrl: ContainerURL;
}

export const completed = 'completed';

export function getContainerURL(containerUrl: string) {
  return new ContainerURL(containerUrl, StorageURL.newPipeline(new AnonymousCredential()));
}

export function getSafePathSegment(directory: string) {
  return directory.replace(/[^a-zA-Z0-9-_]/g, '');
}

export function getFieldBlobs(blobs: BlobItem[], fieldName: string) {
  return blobs.filter(
    blob => blob.name.startsWith(`${getSafePathSegment(fieldName)}/`) && !blob.name.endsWith(completed)
  );
}
