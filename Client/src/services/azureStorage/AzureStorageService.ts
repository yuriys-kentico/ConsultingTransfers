import { TransferProgressEvent } from '@azure/ms-rest-js';
import { Aborter, BlobURL, BlockBlobURL, ContainerURL, uploadBrowserDataToBlockBlob } from '@azure/storage-blob';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import { BehaviorSubject, Subject } from 'rxjs';
import { createWriteStream } from 'streamsaver';

import { IShowMessageHandlers } from '../../app/shared/header/AppHeaderContext';
import { IUpdateMessage } from '../../app/shared/header/Snack';
import { AzureStorageHelper, IAzureStorageOptions } from './AzureStorageHelper';

export const IAzureStorageService = 'IAzureStorageService';

export interface IAzureStorageService {
  blobs: Subject<BlobItem[]>;
  containerUrl?: ContainerURL;
  containerName?: string;
  createContainer(azureStorageOptions: IAzureStorageOptions, containerName: string): Promise<void>;
  deleteContainer(azureStorageOptions: IAzureStorageOptions, containerName: string): Promise<void>;
  listBlobs(azureStorageOptions: IAzureStorageOptions): Promise<BlobItem[] | undefined>;
  listBlobsSubject(messageHandlers: IShowMessageHandlers): void;
  deleteBlobs(blobs: BlobItem[] | BlobItem, azureStorageOptions: IAzureStorageOptions): Promise<void>;
  deleteBlobsSubject(blobs: BlobItem[] | BlobItem, azureStorageOptions: IAzureStorageOptions): void;
  downloadBlob(blob: BlobItem, azureStorageOptions: IAzureStorageOptions): Promise<void>;
  readBlobString(blob: BlobItem, azureStorageOptions: IAzureStorageOptions): Promise<string | undefined>;
  uploadFiles(
    files: File[] | File,
    directory: string,
    azureStorageOptions: IAzureStorageOptions,
    silent?: boolean
  ): Promise<void>;
}

export class AzureStorageService implements IAzureStorageService {
  blobs: BehaviorSubject<BlobItem[]> = new BehaviorSubject([] as any);
  messageHandlers?: IShowMessageHandlers;
  containerUrl?: ContainerURL;
  containerName: string = '';

  async createContainer(azureStorageOptions: IAzureStorageOptions, containerName: string) {
    const { showInfoUntil, showError, showSuccess } = azureStorageOptions.messageHandlers;

    try {
      var createPromise = azureStorageOptions.containerUrl.create(Aborter.none);

      showInfoUntil(`Creating container "${containerName}"...`, createPromise);

      await createPromise;

      showSuccess(`Done.`);
    } catch (error) {
      console.error(error);
      showError((error.body && error.body.message) || error.message);
    }
  }

  async deleteContainer(azureStorageOptions: IAzureStorageOptions, containerName: string) {
    const { showInfoUntil, showError, showSuccess } = azureStorageOptions.messageHandlers;

    try {
      var deletePromise = azureStorageOptions.containerUrl.delete(Aborter.none);

      showInfoUntil(`Deleting container "${containerName}"...`, deletePromise);

      await deletePromise;

      showSuccess(`Done.`);
    } catch (error) {
      console.error(error);
      showError((error.body && error.body.message) || error.message);
    }
  }

  async listBlobs(azureStorageOptions: IAzureStorageOptions) {
    const { showError } = azureStorageOptions.messageHandlers;

    try {
      let marker: string | undefined;
      const blobs = [];

      do {
        const { nextMarker, segment } = await azureStorageOptions.containerUrl.listBlobFlatSegment(
          Aborter.none,
          marker
        );

        marker = nextMarker;

        const items = segment.blobItems;

        for (const blob of items) {
          blobs.push(blob);
        }
      } while (marker);

      return blobs;
    } catch (error) {
      console.error(error);
      showError((error.body && error.body.message) || error.message);
    }
  }

  async listBlobs2() {
    const blobs = [];

    if (this.containerUrl && this.messageHandlers) {
      const { showError } = this.messageHandlers;

      try {
        let marker: string | undefined;

        do {
          const { nextMarker, segment } = await this.containerUrl.listBlobFlatSegment(Aborter.none, marker);

          marker = nextMarker;

          const items = segment.blobItems;

          for (const blob of items) {
            blobs.push(blob);
          }
        } while (marker);
      } catch (error) {
        console.error(error);
        showError((error.body && error.body.message) || error.message);
      }
    }

    return blobs;
  }

  async listBlobsSubject(messageHandlers: IShowMessageHandlers): Promise<void> {
    this.messageHandlers = messageHandlers;

    this.blobs.next(await this.listBlobs2());
  }

  async deleteBlobs(blobs: BlobItem[] | BlobItem, azureStorageOptions: IAzureStorageOptions) {
    const { showInfo, showError, showSuccess, showWarning } = azureStorageOptions.messageHandlers;

    let blobsToDelete = [];

    if (Array.isArray(blobs)) {
      blobsToDelete = blobs;
    } else {
      blobsToDelete = [blobs];
    }

    const blobNames = blobsToDelete.map(blob => `${blob.name}`).join(', ');

    try {
      if (blobsToDelete.length === 0) {
        showWarning('No files selected.');
      } else {
        showInfo(`Deleting ${blobNames}...`);

        for (const blob of blobsToDelete) {
          await BlobURL.fromContainerURL(azureStorageOptions.containerUrl, blob.name).delete(Aborter.none);
        }

        showSuccess('Done.');
      }
    } catch (error) {
      console.error(error);
      showError((error.body && error.body.message) || error.message);
    }
  }
  async deleteBlobsSubject(blobs: BlobItem | BlobItem[], azureStorageOptions: IAzureStorageOptions): Promise<void> {
    await this.deleteBlobs(blobs, azureStorageOptions);

    this.blobs.next(await this.listBlobs2());
  }

  async downloadBlob(blob: BlobItem, azureStorageOptions: IAzureStorageOptions) {
    const { showInfoUntil, showError, showSuccess } = azureStorageOptions.messageHandlers;

    try {
      const blockBlobURL = BlockBlobURL.fromContainerURL(azureStorageOptions.containerUrl, blob.name);
      const progressSubject = new Subject<IUpdateMessage>();
      const downloadPromise = this.getDownloadPromise(blockBlobURL, progressSubject, blob);

      const response = await downloadPromise;

      if (response.blobBody) {
        showInfoUntil(`Downloading ${blob.name}...`, response.blobBody, progressSubject);

        const body = await response.blobBody;

        const readableStream = new Response(body).body;

        if (readableStream) {
          const fileStream = createWriteStream(blob.name);
          const downloadStream = readableStream.pipeTo(fileStream);

          window.onunload = () => {
            fileStream.abort('User navigated away');
          };

          await downloadStream;
        }

        showSuccess(`Finished downloading ${blob.name}.`);
      }
    } catch (error) {
      console.error(error);
      showError((error.body && error.body.message) || error.message);
    }
  }

  async readBlobString(blob: BlobItem, azureStorageOptions: IAzureStorageOptions) {
    const { showError } = azureStorageOptions.messageHandlers;

    try {
      const blockBlobURL = BlockBlobURL.fromContainerURL(azureStorageOptions.containerUrl, blob.name);

      const progressSubject = new Subject<IUpdateMessage>();

      const downloadPromise = this.getDownloadPromise(blockBlobURL, progressSubject, blob);

      const response = await downloadPromise;

      if (response.blobBody) {
        const body = await response.blobBody;

        const text = await new Response(body).text();

        return text;
      }
    } catch (error) {
      console.error(error);
      showError((error.body && error.body.message) || error.message);
    }
  }

  async uploadFiles(
    files: File[] | File,
    directory: string,
    azureStorageOptions: IAzureStorageOptions,
    silent?: boolean
  ) {
    const { showInfoUntil, showError, showSuccess } = azureStorageOptions.messageHandlers;

    let filesToUpload = [];

    if (Array.isArray(files)) {
      filesToUpload = files;
    } else {
      filesToUpload = [files];
    }

    const safeDirectory = AzureStorageHelper.getSafePathSegment(directory);

    try {
      const promises = [];

      for (const file of filesToUpload) {
        const blockBlobURL = BlockBlobURL.fromContainerURL(
          azureStorageOptions.containerUrl,
          `${safeDirectory}/${file.name}`
        );

        const progressSubject = new Subject<IUpdateMessage>();

        const uploadPromise = this.getUploadPromise(file, blockBlobURL, azureStorageOptions, progressSubject);

        !silent && showInfoUntil(`Uploading ${file.name}...`, uploadPromise, progressSubject);

        promises.push(uploadPromise);
      }

      await Promise.all(promises);

      const fileNames = filesToUpload.map(file => `${file.name}`).join(', ');

      !silent && showSuccess(`Finished uploading ${fileNames}.`);
    } catch (error) {
      console.error(error);
      showError((error.body && error.body.message) || error.message);
    }
  }

  private getUploadPromise(
    file: File,
    blockBlobURL: BlockBlobURL,
    azureStorageOptions: IAzureStorageOptions,
    progressSubject: Subject<IUpdateMessage>
  ) {
    return uploadBrowserDataToBlockBlob(Aborter.none, file, blockBlobURL, {
      blockSize: azureStorageOptions.appOptions.uploadBlockMb * 1024 * 1024,
      parallelism: azureStorageOptions.appOptions.parallelism,
      progress: this.updateProgress(progressSubject, file.size)
    }).then(() => new Promise(resolve => setTimeout(resolve, 1000)));
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
