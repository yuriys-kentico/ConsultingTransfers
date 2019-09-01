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

export const getFiles = async (containerURL: ContainerURL, fileName: string, appHeaderContext: IAppHeaderContext) => {
  const { showError } = appHeaderContext;

  try {
    let marker: string | undefined;

    const blobs = [];

    do {
      const listBlobsResponse = await containerURL.listBlobFlatSegment(Aborter.none, marker);

      marker = listBlobsResponse.nextMarker;

      const items = listBlobsResponse.segment.blobItems;

      for (const blob of items) {
        if (blob.name.startsWith(`${getSafeStorageName(fileName)}/`)) {
          blobs.push(blob);
        }
      }
    } while (marker);

    return blobs;
  } catch (error) {
    console.log(error);
    showError((error.body && error.body.message) || error.message);
  }
};

export const listFiles = async (
  fileList: HTMLSelectElement,
  containerURL: ContainerURL,
  appHeaderContext: IAppHeaderContext
) => {
  fileList.innerHTML = '';

  const { showError, showWarning } = appHeaderContext;

  try {
    let marker: string | undefined;

    do {
      const listBlobsResponse = await containerURL.listBlobFlatSegment(Aborter.none, marker);

      marker = listBlobsResponse.nextMarker;

      const items = listBlobsResponse.segment.blobItems;

      if (items.length === 0) {
        showWarning('There are no files to list.');
      }

      for (const blob of items) {
        fileList.innerHTML += `<option>${blob.name}</option>`;
      }
    } while (marker);
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
  fileList: HTMLSelectElement,
  containerURL: ContainerURL,
  appHeaderContext: IAppHeaderContext
) => {
  const { showInfo, showError, showSuccess, showWarning } = appHeaderContext;

  try {
    if (fileList.selectedOptions.length > 0) {
      showInfo('Deleting files...');

      for (const option of fileList.selectedOptions) {
        const blobURL = BlobURL.fromContainerURL(containerURL, option.text);
        await blobURL.delete(Aborter.none);
      }
      showSuccess('Done.');

      listFiles(fileList, containerURL, appHeaderContext);
    } else {
      showWarning('No files selected.');
    }
  } catch (error) {
    console.log(error);
    showError((error.body && error.body.message) || error.message);
  }
};

export const getSafeStorageName = (containerName: string) => {
  return containerName.replace(/_/g, '');
};
