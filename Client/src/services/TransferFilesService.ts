import { BehaviorSubject, Subject } from 'rxjs';
import { createWriteStream } from 'streamsaver';

import { AbortController, AbortSignalLike } from '@azure/abort-controller';
import { TransferProgressEvent } from '@azure/core-http';
import { BlobClient, BlockBlobClient, ContainerClient } from '@azure/storage-blob';

import { IMessageContext } from '../app/frontend/header/MessageContext';
import { IUpdateMessage } from '../app/frontend/header/snacks';
import { azureStorage } from '../appSettings.json';
import { services } from '../terms.en-us.json';
import { ensureArray } from '../utilities/arrays';
import { wait } from '../utilities/promises';
import { format } from '../utilities/strings';
import { IField } from './models/IField';
import { IFile } from './models/IFile';
import { ITransfer } from './models/ITransfer';

export const ITransferFilesService = 'ITransferFilesService';

export class TransferFilesService {
  files: BehaviorSubject<IFile[] | undefined> = new BehaviorSubject<IFile[] | undefined>(undefined);
  messageContext!: IMessageContext;
  containerClient!: ContainerClient;

  fields: IField[] = [];

  async getFiles(transfer: ITransfer) {
    const { containerUrl, fields } = transfer;

    this.containerClient = new ContainerClient(containerUrl);
    this.fields = fields;

    await this.listFiles();
  }

  async listFiles() {
    const { showError } = this.messageContext;

    try {
      const files: IFile[] = [];

      const fieldPairs = this.fields.map(field => ({ folder: this.getSafePathSegment(field.name), field }));

      for await (const blob of this.containerClient.listBlobsFlat()) {
        const matchedFieldPair = fieldPairs.find(fieldPair => blob.name.indexOf(fieldPair.folder) > -1);

        if (matchedFieldPair) {
          files.push({
            name: blob.name.split('/').pop()!,
            path: blob.name,
            sizeBytes: blob.properties.contentLength || 0,
            modified: blob.properties.lastModified,
            field: matchedFieldPair.field
          });
        }
      }

      this.files.next(files);
    } catch (error) {
      showError(error);
    }
  }

  async deleteFiles(files: IFile | IFile[], silent?: boolean) {
    const { showInfo, showError, showSuccess, showWarning } = this.messageContext;

    const filesToDelete = ensureArray(files);

    try {
      if (filesToDelete.length === 0) {
        showWarning(services.noFilesSelected);
      } else {
        !silent && showInfo(format(services.deletingFiles, filesToDelete.map(file => file.name).join(', ')));

        for (const file of filesToDelete) {
          this.containerClient.deleteBlob(file.path);
        }

        !silent && showSuccess(services.done);
      }
    } catch (error) {
      showError(error);
    }

    await this.listFiles();
  }

  async uploadFiles(files: File | File[], directory: string, silent?: boolean) {
    const { showInfoUntil, showError, showWarning, showSuccess } = this.messageContext;

    const filesToUpload = ensureArray(files);

    const safeDirectory = this.getSafePathSegment(directory);

    try {
      const promises = [];

      for (const file of filesToUpload) {
        const blockBlobClient = this.containerClient.getBlockBlobClient(`${safeDirectory}/${file.name}`);
        const progressSubject = new Subject<IUpdateMessage>();
        const abortController = new AbortController();
        const uploadPromise = this.getUploadPromise(file, blockBlobClient, progressSubject, abortController.signal);

        !silent &&
          showInfoUntil(
            format(services.uploadingFiles, file.name),
            uploadPromise,
            () => abortController.abort(),
            progressSubject
          );

        promises.push(uploadPromise);
      }

      await Promise.all(promises);

      const fileNames = filesToUpload.map(file => `${file.name}`).join(', ');

      !silent && showSuccess(format(services.finishedUploading, fileNames));
    } catch (error) {
      if (error.name === 'AbortError') {
        showWarning(services.abortUpload);
      } else {
        showError(error);
      }
    }

    await this.listFiles();
  }

  async downloadFiles(files: IFile | IFile[]) {
    const { showInfoUntil, showError, showWarning, showSuccess } = this.messageContext;

    const filesToDownload = ensureArray(files);

    try {
      const promises: { [key: string]: Promise<Blob> } = {};

      for (const file of filesToDownload) {
        const blobClient = this.containerClient.getBlobClient(file.path);
        const progressSubject = new Subject<IUpdateMessage>();
        const abortController = new AbortController();
        const downloadPromise = this.getDownloadPromise(
          blobClient,
          progressSubject,
          file.sizeBytes,
          abortController.signal
        );

        const response = await downloadPromise;

        if (response.blobBody) {
          showInfoUntil(
            format(services.downloadingFile, file.name),
            response.blobBody,
            () => abortController.abort(),
            progressSubject
          );

          promises[file.name] = response.blobBody;
        }
      }

      for (const fileName in promises) {
        const promise = promises[fileName];

        const stream = await promise;

        const readableStream = (stream as any).stream();

        if (readableStream) {
          const fileStream = createWriteStream(fileName, { size: stream.size });
          const downloadStream = readableStream.pipeTo(fileStream);

          window.onunload = () => {
            fileStream.abort(services.abortDownload);
          };

          await downloadStream;
        }
      }

      showSuccess(format(services.finishedDownloading, filesToDownload.map(blob => blob.name).join(', ')));
    } catch (error) {
      if (error.name === 'AbortError') {
        showWarning(services.abortDownload);
      } else {
        showError(error);
      }
    }
  }

  async readFileAsText(file: IFile) {
    const { showError } = this.messageContext;

    try {
      const blobClient = this.containerClient.getBlobClient(file.path);

      const progressSubject = new Subject<IUpdateMessage>();

      const downloadPromise = this.getDownloadPromise(blobClient, progressSubject, file.sizeBytes);

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

  getFile(content: BlobPart | BlobPart[], name: string, extension: string, type: string) {
    const contentArray = ensureArray(content);
    return new File(contentArray, `${this.getSafePathSegment(name)}.${extension}`, { type });
  }

  getSafePathSegment(directory: string) {
    return directory.replace(/[^a-zA-Z0-9-_]/g, '');
  }

  getFieldFiles(files: IFile[], fieldName: string) {
    return files.filter(file => file.field.name === fieldName);
  }

  private getUploadPromise(
    file: File,
    blockBlobClient: BlockBlobClient,
    progressSubject: Subject<IUpdateMessage>,
    abortSignal?: AbortSignalLike
  ) {
    return blockBlobClient
      .uploadBrowserData(file, {
        blockSize: azureStorage.blockSize * 1024 * 1024,
        concurrency: azureStorage.concurrency,
        onProgress: this.updateProgress(progressSubject, file.size),
        abortSignal: abortSignal
      })
      .then(() => wait(1000));
  }

  private getDownloadPromise(
    blobClient: BlobClient,
    progressSubject: Subject<IUpdateMessage>,
    sizeBytes: number,
    abortSignal?: AbortSignalLike
  ) {
    return blobClient.download(undefined, undefined, {
      onProgress: this.updateProgress(progressSubject, sizeBytes),
      abortSignal: abortSignal
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
