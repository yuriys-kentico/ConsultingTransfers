import { AnonymousCredential, ContainerURL, StorageURL } from '@azure/storage-blob';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';

import { IShowMessageHandlers } from '../../app/shared/header/AppHeaderContext';

interface IAzureStorageAppOptions {
  uploadBlockMb: number;
  parallelism: number;
}

export interface IAzureStorageOptions {
  appOptions: IAzureStorageAppOptions;
  messageHandlers: IShowMessageHandlers;
  containerUrl: ContainerURL;
}

export class AzureStorageHelper {
  static completed = 'completed';

  static getContainerURL(containerUrl: string) {
    return new ContainerURL(containerUrl, StorageURL.newPipeline(new AnonymousCredential()));
  }

  static getSafePathSegment(directory: string) {
    return directory.replace(/[^a-zA-Z0-9-_]/g, '');
  }

  static getFieldBlobs(blobs: BlobItem[], fieldName: string) {
    return blobs.filter(
      blob =>
        blob.name.startsWith(`${AzureStorageHelper.getSafePathSegment(fieldName)}/`) &&
        !blob.name.endsWith(AzureStorageHelper.completed)
    );
  }
}
