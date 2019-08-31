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
import { AppContext } from '../app/AppContext';
import { Subject } from 'rxjs';
import { toRounded } from './numbers';
import { IAppHeaderContext } from '../app/header/AppHeaderContext';

export const useContainer = () => {
  const appContext = useContext(AppContext);

  const accountName = appContext.azureStorage.accountName;
  const containerName = appContext.azureStorage.containerName;
  const sasString = appContext.azureStorage.sasToken;

  const containerURL = new ContainerURL(
    `https://${accountName}.blob.core.windows.net/${containerName}?${sasString}`,
    StorageURL.newPipeline(new AnonymousCredential())
  );

  return { containerName, containerURL };
};

export const createContainer = async (
  containerName: string,
  containerURL: ContainerURL,
  appHeaderContext: IAppHeaderContext
) => {
  const { showInfo, showError, showSuccess } = appHeaderContext;

  try {
    showInfo(`Creating container "${containerName}"...`);
    await containerURL.create(Aborter.none);
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
  const { showInfo, showError, showSuccess } = appHeaderContext;

  try {
    showInfo(`Deleting container "${containerName}"...`);

    await containerURL.delete(Aborter.none);

    showSuccess(`Done.`);
  } catch (error) {
    showError((error.body && error.body.message) || error.message);
  }
};

export const listFiles = async (
  fileList: HTMLSelectElement,
  containerURL: ContainerURL,
  appHeaderContext: IAppHeaderContext
) => {
  fileList.innerHTML = '';

  const { showError } = appHeaderContext;

  try {
    let marker: string | undefined;

    do {
      const listBlobsResponse = await containerURL.listBlobFlatSegment(Aborter.none, marker);

      marker = listBlobsResponse.nextMarker;

      const items = listBlobsResponse.segment.blobItems;

      for (const blob of items) {
        fileList.innerHTML += `<option>${blob.name}</option>`;
      }
    } while (marker);
  } catch (error) {
    showError((error.body && error.body.message) || error.message);
  }
};

export const uploadFiles = async (
  fileInput: HTMLInputElement,
  fileList: HTMLSelectElement,
  containerURL: ContainerURL,
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
        const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, file.name);

        const subject = new Subject<{ progress: number; text: string }>();

        const uploadPromise = uploadBrowserDataToBlockBlob(Aborter.none, file, blockBlobURL, {
          blockSize: 100 * 1024 * 1024,
          parallelism: 20,
          progress: progress => {
            subject.next({
              progress: progress.loadedBytes / file.size,
              text: `${toRounded(progress.loadedBytes / 1000 / 1000, 2)} MB uploaded`
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
    listFiles(fileList, containerURL, appHeaderContext);
  } catch (error) {
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
    showError((error.body && error.body.message) || error.message);
  }
};
