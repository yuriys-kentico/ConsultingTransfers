import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import { createContext } from 'react';

import { ITransfer } from '../../../connectors/AzureFunctions';

export interface ITransferContext {
  transfer: ITransfer;
  blobs: BlobItem[];
  deleteBlobs: (blobs: BlobItem[] | BlobItem) => void;
  downloadBlob: (blob: BlobItem) => void;
  readBlobString: (blob: BlobItem) => Promise<string | undefined>;
  uploadFiles: (files: File[] | File, directory: string, silent?: boolean) => Promise<void>;
  createContainer: (containerName: string) => void;
  deleteContainer: (containerName: string) => void;
}

export const TransferContext = createContext<ITransferContext>({} as any);