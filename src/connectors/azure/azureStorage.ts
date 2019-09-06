import {
    Aborter,
    AnonymousCredential,
    BlobURL,
    BlockBlobURL,
    ContainerURL,
    StorageURL,
    uploadBrowserDataToBlockBlob,
} from '@azure/storage-blob';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import { useContext } from 'react';
import { Subject } from 'rxjs';
import { createWriteStream } from 'streamsaver';

import { AppContext } from '../../app/AppContext';
import { IShowMessageHandlers } from '../../app/shared/header/AppHeaderContext';
import { IUpdateMessage } from '../../app/shared/header/Snack';
import { toRounded } from '../../utilities/numbers';

interface IAzureStorageAppOptions {
  uploadBlockMb: number;
}

export interface IAzureStorageOptions {
  appOptions: IAzureStorageAppOptions;
  messageHandlers: IShowMessageHandlers;
}

const getUploadPromise = (
  file: File,
  blockBlobURL: BlockBlobURL,
  azureStorageOptions: IAzureStorageOptions,
  progressSubject: Subject<IUpdateMessage>
) => {
  return uploadBrowserDataToBlockBlob(Aborter.none, file, blockBlobURL, {
    blockSize: azureStorageOptions.appOptions.uploadBlockMb * 1024 * 1024,
    parallelism: 20,
    progress: progress => {
      progressSubject.next({
        progress: progress.loadedBytes / file.size,
        text: `${toRounded(progress.loadedBytes / 1024 / 1024, 2)} MB uploaded`
      });
    }
  }).then(() => new Promise(resolve => setTimeout(resolve, 1000)));
};

const getDownloadPromise = (blockBlobURL: BlockBlobURL, progressSubject: Subject<IUpdateMessage>, blob: BlobItem) => {
  return blockBlobURL.download(Aborter.none, 0, undefined, {
    progress: progress => {
      progressSubject.next({
        progress: blob.properties.contentLength ? progress.loadedBytes / blob.properties.contentLength : 0,
        text: `${toRounded(progress.loadedBytes / 1024 / 1024, 2)} MB downloaded`
      });
    }
  });
};

export const getFieldBlobs = (blobs: BlobItem[], fieldName: string) =>
  blobs.filter(blob => blob.name.startsWith(`${fieldName}/`) && !blob.name.endsWith('completed'));

export const getContainerURL = (accountName: string, containerName: string, sasString: string) => {
  return new ContainerURL(
    `https://${accountName}.blob.core.windows.net/${containerName}?${sasString}`,
    StorageURL.newPipeline(new AnonymousCredential())
  );
};

export const useContainer = (containerName: string) => {
  const appContext = useContext(AppContext);

  const accountName = appContext.azureStorage.accountName;
  const sasString = appContext.azureStorage.sasToken;

  const safeContainerName = getSafeStorageName(containerName);

  const containerURL = getContainerURL(accountName, safeContainerName, sasString);

  return { containerName: safeContainerName, containerURL };
};

const createContainer = async (
  containerName: string,
  containerURL: ContainerURL,
  azureStorageOptions: IAzureStorageOptions
) => {
  const { showInfoUntil, showError, showSuccess } = azureStorageOptions.messageHandlers;

  try {
    var createPromise = containerURL.create(Aborter.none);

    showInfoUntil(`Creating container "${containerName}"...`, createPromise);

    await createPromise;

    showSuccess(`Done.`);
  } catch (error) {
    showError((error.body && error.body.message) || error.message);
  }
};

const deleteContainer = async (
  containerName: string,
  containerURL: ContainerURL,
  azureStorageOptions: IAzureStorageOptions
) => {
  const { showInfoUntil, showError, showSuccess } = azureStorageOptions.messageHandlers;

  try {
    var deletePromise = containerURL.delete(Aborter.none);

    showInfoUntil(`Deleting container "${containerName}"...`, deletePromise);

    await deletePromise;

    showSuccess(`Done.`);
  } catch (error) {
    console.log(error);
    showError((error.body && error.body.message) || error.message);
  }
};

const listBlobs = async (containerURL: ContainerURL, azureStorageOptions: IAzureStorageOptions) => {
  const { showError } = azureStorageOptions.messageHandlers;

  try {
    let marker: string | undefined;

    const blobs = [];

    do {
      const { nextMarker, segment } = await containerURL.listBlobFlatSegment(Aborter.none, marker);

      marker = nextMarker;

      const items = segment.blobItems;

      for (const blob of items) {
        blobs.push(blob);
      }
    } while (marker);

    return blobs;
  } catch (error) {
    console.log(error);
    showError((error.body && error.body.message) || error.message);
  }
};

const deleteBlobs = async (
  blobs: BlobItem[] | BlobItem,
  containerURL: ContainerURL,
  azureStorageOptions: IAzureStorageOptions
) => {
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
        await BlobURL.fromContainerURL(containerURL, blob.name).delete(Aborter.none);
      }

      showSuccess('Done.');
    }
  } catch (error) {
    console.log(error);
    showError((error.body && error.body.message) || error.message);
  }
};

const downloadBlob = async (blob: BlobItem, containerURL: ContainerURL, azureStorageOptions: IAzureStorageOptions) => {
  const { showInfoUntil, showError, showSuccess } = azureStorageOptions.messageHandlers;

  try {
    const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, blob.name);

    const progressSubject = new Subject<IUpdateMessage>();

    const downloadPromise = getDownloadPromise(blockBlobURL, progressSubject, blob);

    const response = await downloadPromise;

    if (response.blobBody) {
      showInfoUntil(`Downloading ${blob.name}...`, response.blobBody, progressSubject);

      const body = await response.blobBody;

      const fileStream = createWriteStream(blob.name, {
        highWaterMark: 16
      });

      const readableStream = new Response(body).body;

      if (readableStream) {
        const downloadStream = readableStream.pipeTo(fileStream);

        await downloadStream;
      }

      showSuccess(`Finished downloading ${blob.name}.`);
    }
  } catch (error) {
    console.log(error);
    showError((error.body && error.body.message) || error.message);
  }
};

const readBlobString = async (
  blob: BlobItem,
  containerURL: ContainerURL,
  azureStorageOptions: IAzureStorageOptions
) => {
  const { showError } = azureStorageOptions.messageHandlers;

  try {
    const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, blob.name);

    const progressSubject = new Subject<IUpdateMessage>();

    const downloadPromise = getDownloadPromise(blockBlobURL, progressSubject, blob);

    const response = await downloadPromise;

    if (response.blobBody) {
      const body = await response.blobBody;

      const text = await new Response(body).text();

      return text;
    }
  } catch (error) {
    console.log(error);
    showError((error.body && error.body.message) || error.message);
  }
};

const uploadFiles = async (
  files: File[] | File,
  directory: string,
  containerURL: ContainerURL,
  azureStorageOptions: IAzureStorageOptions,
  silent?: boolean
) => {
  const { showInfoUntil, showError, showSuccess } = azureStorageOptions.messageHandlers;

  let filesToUpload = [];

  if (Array.isArray(files)) {
    filesToUpload = files;
  } else {
    filesToUpload = [files];
  }

  try {
    const promises = [];

    for (const file of filesToUpload) {
      const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, `${directory}/${file.name}`);

      const progressSubject = new Subject<IUpdateMessage>();

      const uploadPromise = getUploadPromise(file, blockBlobURL, azureStorageOptions, progressSubject);

      !silent && showInfoUntil(`Uploading file ${file.name}...`, uploadPromise, progressSubject);

      promises.push(uploadPromise);
    }

    await Promise.all(promises);

    const fileNames = filesToUpload.map(file => `${file.name}`).join(', ');

    !silent && showSuccess(`Finished uploading ${fileNames}.`);
  } catch (error) {
    console.log(error);
    showError((error.body && error.body.message) || error.message);
  }
};

export const AzureStorage = {
  createContainer,
  deleteContainer,
  listBlobs,
  deleteBlobs,
  downloadBlob,
  readBlobString,
  uploadFiles
};

export const getSafeStorageName = (containerName: string) => {
  return containerName.replace(/_/g, '');
};
