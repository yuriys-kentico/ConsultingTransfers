import {
  ContainerURL,
  Aborter,
  BlockBlobURL,
  uploadBrowserDataToBlockBlob,
  BlobURL,
  StorageURL,
  AnonymousCredential
} from '@azure/storage-blob';
import { ShowInfoHandler } from '../header/AppHeader';
import { useContext } from 'react';
import { AppContext } from '../AppContext';

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
  showInfo: ShowInfoHandler,
  showError: ShowInfoHandler
) => {
  try {
    showInfo(`Creating container "${containerName}"...`);
    await containerURL.create(Aborter.none);
    showInfo(`Done.`);
  } catch (error) {
    showError((error.body && error.body.message) || error.message);
  }
};

export const deleteContainer = async (
  containerName: string,
  containerURL: ContainerURL,
  showInfo: ShowInfoHandler,
  showError: ShowInfoHandler
) => {
  try {
    showInfo(`Deleting container "${containerName}"...`);
    await containerURL.delete(Aborter.none);
    showInfo(`Done.`);
  } catch (error) {
    showError((error.body && error.body.message) || error.message);
  }
};

export const listFiles = async (
  fileList: HTMLSelectElement,
  containerURL: ContainerURL,
  showInfo: ShowInfoHandler,
  showError: ShowInfoHandler
) => {
  fileList.innerHTML = '';
  try {
    showInfo('Retrieving file list...');

    let marker: string | undefined;

    do {
      const listBlobsResponse = await containerURL.listBlobFlatSegment(Aborter.none, marker);

      marker = listBlobsResponse.nextMarker;

      const items = listBlobsResponse.segment.blobItems;

      for (const blob of items) {
        fileList.innerHTML += `<option>${blob.name}</option>`;
      }
    } while (marker);
    showInfo('Done.');
  } catch (error) {
    showError((error.body && error.body.message) || error.message);
  }
};

export const uploadFiles = async (
  files: FileList | null,
  fileList: HTMLSelectElement,
  containerURL: ContainerURL,
  showInfo: ShowInfoHandler,
  showError: ShowInfoHandler
) => {
  try {
    showInfo('Uploading files...');

    const promises = [];

    if (files) {
      for (const file of files) {
        const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, file.name);

        promises.push(uploadBrowserDataToBlockBlob(Aborter.none, file, blockBlobURL));
      }
    }
    await Promise.all(promises);

    showInfo('Done.');

    listFiles(fileList, containerURL, showInfo, showError);
  } catch (error) {
    showError((error.body && error.body.message) || error.message);
  }
};

export const deleteFiles = async (
  fileList: HTMLSelectElement,
  containerURL: ContainerURL,
  showInfo: ShowInfoHandler,
  showError: ShowInfoHandler
) => {
  try {
    if (fileList.selectedOptions.length > 0) {
      showInfo('Deleting files...');

      for (const option of fileList.selectedOptions) {
        const blobURL = BlobURL.fromContainerURL(containerURL, option.text);
        await blobURL.delete(Aborter.none);
      }
      showInfo('Done.');

      listFiles(fileList, containerURL, showInfo, showError);
    } else {
      showInfo('No files selected.');
    }
  } catch (error) {
    showError((error.body && error.body.message) || error.message);
  }
};
