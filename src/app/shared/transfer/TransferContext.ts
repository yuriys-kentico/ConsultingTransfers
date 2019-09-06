import { ContainerURL } from '@azure/storage-blob';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import { LanguageVariantResponses } from 'kentico-cloud-content-management';
import { createContext } from 'react';

import { Field } from '../../../connectors/kenticoCloud/contentTypes/Field';
import { Request } from '../../../connectors/kenticoCloud/contentTypes/Request';

export interface ITransferContext {
  request: Request;
  blobs: BlobItem[];
  deleteBlobs: (blobs: BlobItem[] | BlobItem, containerURL: ContainerURL) => void;
  downloadBlob: (blob: BlobItem, containerURL: ContainerURL) => void;
  readBlobString: (blob: BlobItem, containerURL: ContainerURL) => Promise<string | undefined>;
  uploadFiles: (files: File[] | File, directory: string, containerURL: ContainerURL, silent?: boolean) => Promise<void>;
  createContainer: (containerName: string, containerURL: ContainerURL) => void;
  deleteContainer: (containerName: string, containerURL: ContainerURL) => void;
  updateCompletedField: (
    request: Request,
    field: Field
  ) => Promise<LanguageVariantResponses.UpsertLanguageVariantResponse>;
}

export const TransferContext = createContext<ITransferContext>({} as any);
