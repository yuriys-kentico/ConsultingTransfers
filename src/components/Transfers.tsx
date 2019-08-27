import React, { SyntheticEvent, useRef, useState, useEffect, ReactNode } from 'react';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import {
  ContainerURL,
  StorageURL,
  AnonymousCredential,
  BlockBlobURL,
  BlobURL,
  uploadBrowserDataToBlockBlob,
  Aborter
} from '@azure/storage-blob';
import { RoutedFC } from '../types/routing/RoutedFC';
import {
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@material-ui/core';
import { AppSettings } from '../types/AppSettings';
import EditIcon from '@material-ui/icons/Edit';
import { DeliveryClient, ContentItem } from 'kentico-cloud-delivery';
import { Link } from '@reach/router';

interface SnackbarMessage {
  message: string;
  key: number;
}

export const Transfers: RoutedFC = () => {
  const deliveryClient = new DeliveryClient({ ...AppSettings.kenticoCloud });

  const [items, setItems] = useState<ContentItem[]>();

  useEffect(() => {
    deliveryClient
      .items()
      .type('consulting_request')
      .toObservable()
      .subscribe(response => {
        setItems(response.items);
      });
  }, []);

  let fileInput: HTMLInputElement | null;

  const fileListRef = useRef<HTMLSelectElement>(null);

  const styles = makeStyles((theme: Theme) =>
    createStyles({
      button: {
        margin: theme.spacing(1)
      }
    })
  )();

  const queueRef = useRef<SnackbarMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState<SnackbarMessage>({
    message: '',
    key: 0
  });

  const processQueue = () => {
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift();

      if (next) {
        setMessageInfo(next);
        setOpen(true);
      }
    }
  };

  const reportStatus = (message: string) => {
    queueRef.current.push({
      message,
      key: new Date().getTime()
    });

    if (open) {
      setOpen(false);
    } else {
      processQueue();
    }
  };

  const handleClose = (_event: SyntheticEvent | MouseEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const accountName = AppSettings.azureStorage.accountName;
  const containerName = AppSettings.azureStorage.containerName;
  const sasString = AppSettings.azureStorage.sasToken;

  const containerURL = new ContainerURL(
    `https://${accountName}.blob.core.windows.net/${containerName}?${sasString}`,
    StorageURL.newPipeline(new AnonymousCredential())
  );

  const createContainer = async () => {
    try {
      reportStatus(`Creating container "${containerName}"...`);
      await containerURL.create(Aborter.none);
      reportStatus(`Done.`);
    } catch (error) {
      reportStatus((error.body && error.body.message) || error.message);
    }
  };

  const deleteContainer = async () => {
    try {
      reportStatus(`Deleting container "${containerName}"...`);
      await containerURL.delete(Aborter.none);
      reportStatus(`Done.`);
    } catch (error) {
      reportStatus((error.body && error.body.message) || error.message);
    }
  };

  const listFiles = async () => {
    const fileList = fileListRef.current;

    if (fileList) {
      fileList.innerHTML = '';
      try {
        reportStatus('Retrieving file list...');

        let marker: string | undefined;

        do {
          const listBlobsResponse = await containerURL.listBlobFlatSegment(Aborter.none, marker);

          marker = listBlobsResponse.nextMarker;

          const items = listBlobsResponse.segment.blobItems;

          for (const blob of items) {
            fileList.innerHTML += `<option>${blob.name}</option>`;
          }
        } while (marker);
        reportStatus('Done.');
      } catch (error) {
        reportStatus((error.body && error.body.message) || error.message);
      }
    }
  };

  const uploadFiles = async () => {
    if (fileInput) {
      try {
        reportStatus('Uploading files...');

        const promises = [];

        if (fileInput.files) {
          for (const file of fileInput.files) {
            const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, file.name);

            promises.push(uploadBrowserDataToBlockBlob(Aborter.none, file, blockBlobURL));
          }
        }
        await Promise.all(promises);
        reportStatus('Done.');
        listFiles();
      } catch (error) {
        reportStatus((error.body && error.body.message) || error.message);
      }
    }
  };

  const deleteFiles = async () => {
    const fileList = fileListRef.current;

    if (fileList) {
      try {
        if (fileList.selectedOptions.length > 0) {
          reportStatus('Deleting files...');

          for (const option of fileList.selectedOptions) {
            const blobURL = BlobURL.fromContainerURL(containerURL, option.text);
            await blobURL.delete(Aborter.none);
          }
          reportStatus('Done.');

          listFiles();
        } else {
          reportStatus('No files selected.');
        }
      } catch (error) {
        reportStatus((error.body && error.body.message) || error.message);
      }
    }
  };

  function renderItems(): ReactNode {
    if (items) {
      return items.map((item, index) => (
        <ListItem key={index} button>
          <ListItemText primary={`${item.system.name}`} />
          <ListItemSecondaryAction>
            <IconButton component={Link} to={`${item.url.value}`}>
              <EditIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ));
    }
  }

  return (
    <Box m={3}>
      <Typography variant='h4' gutterBottom>
        Active transfers:
      </Typography>
      <List>{renderItems()}</List>

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
      <Snackbar
        key={messageInfo.key}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        onExited={() => processQueue()}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
        message={<span id='message-id'>{messageInfo.message}</span>}
      />
      <Typography variant='h6' gutterBottom>
        Files:
      </Typography>
      <select ref={fileListRef} multiple style={{ height: '222px', width: '593px', overflowY: 'scroll' }} />
    </Box>
  );
};
