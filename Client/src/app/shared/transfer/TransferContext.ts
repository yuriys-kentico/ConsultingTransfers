import { ContainerURL } from '@azure/storage-blob';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import { createContext } from 'react';

import { IRequestItem } from '../../../connectors/azureFunctions/RequestItem';

export interface ITransferContext {
  containerName: string;
  containerURL: ContainerURL;
  requestItem: IRequestItem;
  blobs: BlobItem[];
  deleteBlobs: (blobs: BlobItem[] | BlobItem, containerURL: ContainerURL) => void;
  downloadBlob: (blob: BlobItem, containerURL: ContainerURL) => void;
  readBlobString: (blob: BlobItem, containerURL: ContainerURL) => Promise<string | undefined>;
  uploadFiles: (files: File[] | File, directory: string, containerURL: ContainerURL, silent?: boolean) => Promise<void>;
  createContainer: (containerName: string, containerURL: ContainerURL) => void;
  deleteContainer: (containerName: string, containerURL: ContainerURL) => void;
}

export const TransferContext = createContext<ITransferContext>({} as any);
