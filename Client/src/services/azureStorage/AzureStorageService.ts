import { TransferProgressEvent } from '@azure/ms-rest-js';
import { Aborter, BlobURL, BlockBlobURL, ContainerURL, uploadBrowserDataToBlockBlob } from '@azure/storage-blob';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import { BehaviorSubject, Subject } from 'rxjs';
import { createWriteStream } from 'streamsaver';

import { IMessageContext, IMessageHandlers } from '../../app/shared/header/MessageContext';
import { IUpdateMessage } from '../../app/shared/header/Snack';
import { azureStorage, terms } from '../../appSettings.json';
import { ensureArray } from '../../utilities/arrays';
import { promiseAfter } from '../../utilities/promises';
import { format } from '../../utilities/strings';
import { getContainerURL, getSafePathSegment } from './azureStorage';

export const IAzureStorageService = 'IAzureStorageService';

export interface IAzureStorageService {
  blobs: BehaviorSubject<BlobItem[]>;
  containerUrl: ContainerURL;
  containerName: string;
  messageHandlers: IMessageContext;
  initialize(containerName: string, containerUrl: string): Promise<void>;
  createContainer(containerName: string): Promise<void>;
  deleteContainer(containerName: string): Promise<void>;
  listBlobs(messageHandlers: IMessageHandlers): void;
  deleteBlobs(blobs: BlobItem | BlobItem[]): Promise<void>;
  uploadFiles(files: File[] | File, directory: string, silent?: boolean): Promise<void>;
  downloadBlob(blob: BlobItem): Promise<void>;
  readBlobString(blob: BlobItem): Promise<string | undefined>;
}

export class AzureStorageService implements IAzureStorageService {
  blobs: BehaviorSubject<BlobItem[]> = new BehaviorSubject([] as BlobItem[]);
  containerUrl!: ContainerURL;
  containerName!: string;
  messageHandlers!: IMessageContext;

  async initialize(containerName: string, containerUrl: string) {
    this.containerName = containerName;
    this.containerUrl = getContainerURL(containerUrl);

    await this.listBlobs();
  }

  async createContainer(containerName: string) {
    const { showInfoUntil, showError, showSuccess } = this.messageHandlers;

    try {
      var createPromise = this.containerUrl.create(Aborter.none);

      showInfoUntil(format(terms.azureStorage.creatingContainer, containerName), createPromise);

      await createPromise;

      showSuccess(terms.azureStorage.done);
    } catch (error) {
      showError(error);
    }
  }

  async deleteContainer(containerName: string) {
    const { showInfoUntil, showError, showSuccess } = this.messageHandlers;

    try {
      var deletePromise = this.containerUrl.delete(Aborter.none);

      showInfoUntil(format(terms.azureStorage.deletingContainer, containerName), deletePromise);

      await deletePromise;

      showSuccess(terms.azureStorage.done);
    } catch (error) {
      showError(error);
    }
  }

  async listBlobs() {
    let blobs: BlobItem[] = [];

    const { showError } = this.messageHandlers;

    try {
      let marker: string | undefined;

      do {
        const { nextMarker, segment } = await this.containerUrl.listBlobFlatSegment(Aborter.none, marker);

        blobs = blobs.concat(segment.blobItems);

        marker = nextMarker;
      } while (marker);
    } catch (error) {
      showError(error);
    }

    this.blobs.next(blobs);
  }

  async deleteBlobs(blobs: BlobItem | BlobItem[]) {
    const { showInfo, showError, showSuccess, showWarning } = this.messageHandlers;

    let blobsToDelete = ensureArray(blobs);

    const blobNames = blobsToDelete.map(blob => `${blob.name}`).join(', ');

    try {
      if (blobsToDelete.length === 0) {
        showWarning(terms.azureStorage.noFilesSelected);
      } else {
        showInfo(format(terms.azureStorage.deletingFiles, blobNames));

        for (const blob of blobsToDelete) {
          await BlobURL.fromContainerURL(this.containerUrl, blob.name).delete(Aborter.none);
        }

        showSuccess(terms.azureStorage.done);
      }
    } catch (error) {
      showError(error);
    }

    await this.listBlobs();
  }

  async uploadFiles(files: File[] | File, directory: string, silent?: boolean) {
    const { showInfoUntil, showError, showSuccess } = this.messageHandlers;

    let filesToUpload = ensureArray(files);

    const safeDirectory = getSafePathSegment(directory);

    try {
      const promises = [];

      for (const file of filesToUpload) {
        const blockBlobURL = BlockBlobURL.fromContainerURL(this.containerUrl, `${safeDirectory}/${file.name}`);
        const progressSubject = new Subject<IUpdateMessage>();
        const uploadPromise = this.getUploadPromise(file, blockBlobURL, progressSubject);

        !silent && showInfoUntil(format(terms.azureStorage.uploadingFiles, file.name), uploadPromise, progressSubject);

        promises.push(uploadPromise);
      }

      await Promise.all(promises);

      const fileNames = filesToUpload.map(file => `${file.name}`).join(', ');

      !silent && showSuccess(format(terms.azureStorage.finishedUploading, fileNames));
    } catch (error) {
      showError(error);
    }

    await this.listBlobs();
  }

  async downloadBlob(blob: BlobItem) {
    const { showInfoUntil, showError, showSuccess } = this.messageHandlers;

    try {
      const blockBlobURL = BlockBlobURL.fromContainerURL(this.containerUrl, blob.name);
      const progressSubject = new Subject<IUpdateMessage>();
      const downloadPromise = this.getDownloadPromise(blockBlobURL, progressSubject, blob);

      const response = await downloadPromise;

      if (response.blobBody) {
        showInfoUntil(format(terms.azureStorage.downloadingFile, blob.name), response.blobBody, progressSubject);

        const body = await response.blobBody;

        const readableStream = new Response(body).body;

        if (readableStream) {
          const fileStream = createWriteStream(blob.name);
          const downloadStream = readableStream.pipeTo(fileStream);

          window.onunload = () => {
            fileStream.abort(terms.azureStorage.abortDownload);
          };

          await downloadStream;
        }

        showSuccess(format(terms.azureStorage.finishedDownloading, blob.name));
      }
    } catch (error) {
      showError(error);
    }
  }

  async readBlobString(blob: BlobItem) {
    const { showError } = this.messageHandlers;

    try {
      const blockBlobURL = BlockBlobURL.fromContainerURL(this.containerUrl, blob.name);

      const progressSubject = new Subject<IUpdateMessage>();

      const downloadPromise = this.getDownloadPromise(blockBlobURL, progressSubject, blob);

      const response = await downloadPromise;

      if (response.blobBody) {
        const body = await response.blobBody;

        const text = await new Response(body).text();

        return text;
      }
    } catch (error) {
      showError(error);
    }
  }

  private getUploadPromise(file: File, blockBlobURL: BlockBlobURL, progressSubject: Subject<IUpdateMessage>) {
    return uploadBrowserDataToBlockBlob(Aborter.none, file, blockBlobURL, {
      blockSize: azureStorage.uploadBlockMb * 1024 * 1024,
      parallelism: azureStorage.parallelism,
      progress: this.updateProgress(progressSubject, file.size)
    }).then(promiseAfter(1000));
  }

  private getDownloadPromise(blockBlobURL: BlockBlobURL, progressSubject: Subject<IUpdateMessage>, blob: BlobItem) {
    return blockBlobURL.download(Aborter.none, 0, undefined, {
      progress: this.updateProgress(progressSubject, blob.properties.contentLength)
    });
  }

  private updateProgress(progressSubject: Subject<IUpdateMessage>, total: number | undefined) {
    return ({ loadedBytes }: TransferProgressEvent) => {
      progressSubject.next({
        current: loadedBytes,
        total: total ? total : 100
      });
    };
  }
}
