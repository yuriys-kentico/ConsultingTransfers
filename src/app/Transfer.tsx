import React, { useState, useEffect, useContext, useRef } from 'react';
import { RoutedFC } from '../routing/RoutedFC';
import { AppContext } from './AppContext';
import { DeliveryClient, ContentItem } from 'kentico-cloud-delivery';
import { Loading } from '../utility/Loading';
import {
  ContainerURL,
  StorageURL,
  AnonymousCredential,
  BlockBlobURL,
  BlobURL,
  uploadBrowserDataToBlockBlob,
  Aborter
} from '@azure/storage-blob';
import { Header, Segment, Button, Divider } from 'semantic-ui-react';
import { HeaderContext } from '../header/HeaderContext';

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
          <Header as='h2' content={`Transfer ${item !== undefined ? item.system.name : props.urlSlug}`} />
          {item.fields.itemCodenames.map((element: string, index: number) => (
            <div key={index}>
              <span>{element}</span>
            </div>
          ))}
        </div>
      );
    }
  }

  return (
    <Segment basic>
      {renderFields(item)}
      <Divider />
      <Button onClick={createContainer} content='Create container' />
      <Button onClick={deleteContainer} secondary content='Delete container' />
      <Button onClick={() => fileInput && fileInput.click()} content='Select and upload files' />
      <Button onClick={listFiles} content='List files' />
      <Button onClick={deleteFiles} secondary content='Delete selected files' />
      <Header as='h2' content='Files:' />
      <input type='file' ref={e => (fileInput = e)} onChange={uploadFiles} multiple style={{ display: 'none' }} />
      <select ref={fileListRef} multiple style={{ height: '222px', width: '593px', overflowY: 'scroll' }} />
    </Segment>
  );
};
