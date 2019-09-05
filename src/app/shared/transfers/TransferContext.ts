import { ContainerURL } from '@azure/storage-blob';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import { createContext } from 'react';

import { ConsultingRequest } from '../../../connectors/kenticoCloud/ConsultingRequest';

export interface ITransferContext {
  request: ConsultingRequest;
  blobs: BlobItem[];
  deleteBlobs: (blobs: BlobItem[] | BlobItem, containerURL: ContainerURL) => void;
  downloadBlob: (blob: BlobItem, containerURL: ContainerURL) => void;
  readBlobString: (blob: BlobItem, containerURL: ContainerURL) => Promise<string | undefined>;
  uploadFiles: (files: File[] | File, directory: string, containerURL: ContainerURL) => void;
  createContainer: (containerName: string, containerURL: ContainerURL) => void;
  deleteContainer: (containerName: string, containerURL: ContainerURL) => void;
}

export const TransferContext = createContext<ITransferContext>({} as any);
