import {
  ContainerURL,
  Aborter,
  BlockBlobURL,
  uploadBrowserDataToBlockBlob,
  BlobURL,
  StorageURL,
  AnonymousCredential
} from '@azure/storage-blob';
import { useContext } from 'react';
import { Subject } from 'rxjs';
import { AppContext } from '../../../AppContext';
import { IAppHeaderContext } from '../../header/AppHeaderContext';
import { toRounded } from '../../../../utilities/numbers';
import { createWriteStream } from 'streamsaver';
import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';

export const useContainer = (containerName: string) => {
  const appContext = useContext(AppContext);

  const accountName = appContext.azureStorage.accountName;
  const sasString = appContext.azureStorage.sasToken;

  const safeContainerName = getSafeStorageName(containerName);

  const containerURL = new ContainerURL(
    `https://${accountName}.blob.core.windows.net/${safeContainerName}?${sasString}`,
    StorageURL.newPipeline(new AnonymousCredential())
  );

  return { containerName: safeContainerName, containerURL };
};

export const createContainer = async (
  containerName: string,
  containerURL: ContainerURL,
  appHeaderContext: IAppHeaderContext
) => {
  const { showInfoUntil, showError, showSuccess } = appHeaderContext;

  try {
    var createPromise = containerURL.create(Aborter.none);

    showInfoUntil(`Creating container "${containerName}"...`, createPromise);

    await createPromise;

    showSuccess(`Done.`);
  } catch (error) {
    showError((error.body && error.body.message) || error.message);
  }
};

export const deleteContainer = async (
  containerName: string,
  containerURL: ContainerURL,
  appHeaderContext: IAppHeaderContext
) => {
  const { showInfoUntil, showError, showSuccess } = appHeaderContext;

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

export const downloadFile = async (blob: BlobItem, containerURL: ContainerURL, appHeaderContext: IAppHeaderContext) => {
  const { showInfoUntil, showError, showSuccess } = appHeaderContext;

  try {
    const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, blob.name);

    const subject = new Subject<{ progress: number; text: string }>();

    const downloadPromise = blockBlobURL.download(Aborter.none, 0, undefined, {
      progress: progress => {
        subject.next({
          progress: blob.properties.contentLength ? progress.loadedBytes / blob.properties.contentLength : 0,
          text: `${toRounded(progress.loadedBytes / 1024 / 1024, 2)} MB downloaded`
        });
      }
    });

    const response = await downloadPromise;

    if (response.blobBody) {
      showInfoUntil(`Downloading ${blob.name}...`, response.blobBody, subject);

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

export const getFiles = async (containerURL: ContainerURL, appHeaderContext: IAppHeaderContext, fieldName?: string) => {
  const { showError, showWarning } = appHeaderContext;

  try {
    let marker: string | undefined;

    const blobs = [];

    do {
      const listBlobsResponse = await containerURL.listBlobFlatSegment(Aborter.none, marker);

      marker = listBlobsResponse.nextMarker;

      const items = listBlobsResponse.segment.blobItems;

      if (items.length === 0) {
        showWarning('There are no files to list.');
      }

      for (const blob of items) {
        if (fieldName && !blob.name.startsWith(`${getSafeStorageName(fieldName)}/`)) {
          continue;
        }
        blobs.push(blob);
      }
    } while (marker);

    return blobs;
  } catch (error) {
    console.log(error);
    showError((error.body && error.body.message) || error.message);
  }
};

export const uploadFiles = async (
  fileInput: HTMLInputElement,
  containerURL: ContainerURL,
  directory: string,
  appHeaderContext: IAppHeaderContext
) => {
  const { showInfoUntil, showError, showSuccess } = appHeaderContext;

  try {
    if (fileInput.files) {
      const fileNames = Array.from(fileInput.files)
        .map(file => `${file.name}`)
        .join(', ');

      const promises = [];

      for (const file of fileInput.files) {
        const blockBlobURL = BlockBlobURL.fromContainerURL(
          containerURL,
          `${getSafeStorageName(directory)}/${file.name}`
        );

        const subject = new Subject<{ progress: number; text: string }>();

        const uploadPromise = uploadBrowserDataToBlockBlob(Aborter.none, file, blockBlobURL, {
          blockSize: 100 * 1024 * 1024,
          parallelism: 20,
          progress: progress => {
            subject.next({
              progress: progress.loadedBytes / file.size,
              text: `${toRounded(progress.loadedBytes / 1024 / 1024, 2)} MB uploaded`
            });
          }
        }).then(() => new Promise(resolve => setTimeout(resolve, 1000)));

        showInfoUntil(`Uploading file ${file.name}...`, uploadPromise, subject);

        promises.push(uploadPromise);
      }
      await Promise.all(promises);

      showSuccess(`Finished uploading ${fileNames}.`);

      fileInput.value = '';
    }
  } catch (error) {
    console.log(error);
    showError((error.body && error.body.message) || error.message);
  }
};

export const deleteFiles = async (
  blobs: BlobItem[],
  containerURL: ContainerURL,
  appHeaderContext: IAppHeaderContext
) => {
  const { showInfo, showError, showSuccess, showWarning } = appHeaderContext;

  const blobNames = Array.from(blobs)
    .map(blob => `${blob.name}`)
    .join(', ');

  try {
    if (blobs.length > 0) {
      showInfo(`Deleting ${blobNames}...`);

      for (const blob of blobs) {
        const blobURL = BlobURL.fromContainerURL(containerURL, blob.name);
        await blobURL.delete(Aborter.none);
      }
      showSuccess('Done.');
    } else {
      showWarning('No files selected.');
    }
  } catch (error) {
    console.log(error);
    showError((error.body && error.body.message) || error.message);
  }
};

export const deleteFile = async (blob: BlobItem, containerURL: ContainerURL, appHeaderContext: IAppHeaderContext) => {
  const { showInfo, showError, showSuccess } = appHeaderContext;

  try {
    showInfo(`Deleting file ${blob.name}...`);

    const blobURL = BlobURL.fromContainerURL(containerURL, blob.name);
    await blobURL.delete(Aborter.none, { deleteSnapshots: 'include' });

    showSuccess('Done.');
  } catch (error) {
    console.log(error);
    showError((error.body && error.body.message) || error.message);
  }
};

export const getSafeStorageName = (containerName: string) => {
  return containerName.replace(/_/g, '');
};
