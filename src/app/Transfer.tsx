import React, { useState, useEffect, useContext, useRef } from 'react';
import { RoutedFC } from '../routing/RoutedFC';
import { Typography, Box } from '@material-ui/core';
import { AppContext } from './AppContext';
import { DeliveryClient, ContentItem } from 'kentico-cloud-delivery';
import { Loading } from './Loading';
import { useStyles } from './Styles';
import Button from '@material-ui/core/Button';
import {
  ContainerURL,
  StorageURL,
  AnonymousCredential,
  BlockBlobURL,
  BlobURL,
  uploadBrowserDataToBlockBlob,
  Aborter
} from '@azure/storage-blob';
import { HeaderContext } from '../navigation/HeaderContext';

export interface ITransferProps {
  urlSlug: string;
}

export const Transfer: RoutedFC<ITransferProps> = props => {
  const appContext = useContext(AppContext);

  const [item, setItem] = useState<ContentItem>();

  useEffect(() => {
    if (props.urlSlug) {
      const deliveryClient = new DeliveryClient({ ...appContext.kenticoCloud });

      deliveryClient
        .items()
        .type('consulting_request')
        .equalsFilter('elements.url', props.urlSlug)
        .toObservable()
        .subscribe(response => {
          setItem(response.items[0]);
        });
    }
  }, [appContext.kenticoCloud, props.urlSlug]);

  let fileInput: HTMLInputElement | null;

  const fileListRef = useRef<HTMLSelectElement>(null);

  const { showMessage } = useContext(HeaderContext);

  const accountName = appContext.azureStorage.accountName;
  const containerName = appContext.azureStorage.containerName;
  const sasString = appContext.azureStorage.sasToken;

  const containerURL = new ContainerURL(
    `https://${accountName}.blob.core.windows.net/${containerName}?${sasString}`,
    StorageURL.newPipeline(new AnonymousCredential())
  );

  const createContainer = async () => {
    try {
      showMessage(`Creating container "${containerName}"...`);
      await containerURL.create(Aborter.none);
      showMessage(`Done.`);
    } catch (error) {
      showMessage((error.body && error.body.message) || error.message);
    }
  };

  const deleteContainer = async () => {
    try {
      showMessage(`Deleting container "${containerName}"...`);
      await containerURL.delete(Aborter.none);
      showMessage(`Done.`);
    } catch (error) {
      showMessage((error.body && error.body.message) || error.message);
    }
  };

  const listFiles = async () => {
    const fileList = fileListRef.current;

    if (fileList) {
      fileList.innerHTML = '';
      try {
        showMessage('Retrieving file list...');

        let marker: string | undefined;

        do {
          const listBlobsResponse = await containerURL.listBlobFlatSegment(Aborter.none, marker);

          marker = listBlobsResponse.nextMarker;

          const items = listBlobsResponse.segment.blobItems;

          for (const blob of items) {
            fileList.innerHTML += `<option>${blob.name}</option>`;
          }
        } while (marker);
        showMessage('Done.');
      } catch (error) {
        showMessage((error.body && error.body.message) || error.message);
      }
    }
  };

  const uploadFiles = async () => {
    if (fileInput) {
      try {
        showMessage('Uploading files...');

        const promises = [];

        if (fileInput.files) {
          for (const file of fileInput.files) {
            const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, file.name);

            promises.push(uploadBrowserDataToBlockBlob(Aborter.none, file, blockBlobURL));
          }
        }
        await Promise.all(promises);
        showMessage('Done.');
        listFiles();
      } catch (error) {
        showMessage((error.body && error.body.message) || error.message);
      }
    }
  };

  const deleteFiles = async () => {
    const fileList = fileListRef.current;

    if (fileList) {
      try {
        if (fileList.selectedOptions.length > 0) {
          showMessage('Deleting files...');

          for (const option of fileList.selectedOptions) {
            const blobURL = BlobURL.fromContainerURL(containerURL, option.text);
            await blobURL.delete(Aborter.none);
          }
          showMessage('Done.');

          listFiles();
        } else {
          showMessage('No files selected.');
        }
      } catch (error) {
        showMessage((error.body && error.body.message) || error.message);
      }
    }
  };

  function renderFields(item: ContentItem | undefined) {
    if (!item) {
      return <Loading />;
    } else {
      return (
        <div>
          <Typography variant='h4' gutterBottom>
            {`Transfer ${item !== undefined ? item.system.name : props.urlSlug}`}
          </Typography>
          {item.fields.itemCodenames.map((element: string) => (
            <div>
              <span>{element}</span>
            </div>
          ))}
        </div>
      );
    }
  }

  const styles = useStyles();

  return (
    <Box m={3} className={styles.root}>
      {renderFields(item)}
      <Button onClick={createContainer} variant='contained' className={styles.button}>
        Create container
      </Button>
      <Button onClick={deleteContainer} variant='contained' color='secondary' className={styles.button}>
        Delete container
      </Button>
      <Button onClick={() => fileInput && fileInput.click()} variant='contained' className={styles.button}>
        Select and upload files
      </Button>
      <input type='file' ref={e => (fileInput = e)} onChange={uploadFiles} multiple style={{ display: 'none' }} />
      <Button onClick={listFiles} variant='contained' className={styles.button}>
        List files
      </Button>
      <Button onClick={deleteFiles} variant='contained' color='secondary' className={styles.button}>
        Delete selected files
      </Button>

      <Typography variant='h6' gutterBottom>
        Files:
      </Typography>
      <select ref={fileListRef} multiple style={{ height: '222px', width: '593px', overflowY: 'scroll' }} />
    </Box>
  );
};
