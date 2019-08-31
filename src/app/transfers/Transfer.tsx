import React, { useState, useEffect, useContext, useRef } from 'react';
import { RoutedFC } from '../RoutedFC';
import { AppContext } from '../AppContext';
import { DeliveryClient, ContentItem } from 'kentico-cloud-delivery';
import { Loading } from './Loading';
import { Header, Segment, Button, Divider } from 'semantic-ui-react';
import { AppHeaderContext } from '../header/AppHeaderContext';
import { createContainer, deleteContainer, listFiles, deleteFiles, uploadFiles, useContainer } from './azureStorage';

export interface ITransferProps {
  urlSlug: string;
}

export const Transfer: RoutedFC<ITransferProps> = props => {
  const appContext = useContext(AppContext);

  const { showInfo, showError } = useContext(AppHeaderContext);

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

  const { containerName, containerURL } = useContainer();

  function renderFields(item: ContentItem | undefined) {
    if (!item) {
      return <Loading />;
    } else {
      return (
        <div>
          <Header as='h2' content={`Transfer ${item.system.name}`} />
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
      <Button
        onClick={() => createContainer(containerName, containerURL, showInfo, showError)}
        content='Create container'
      />
      <Button
        onClick={() => deleteContainer(containerName, containerURL, showInfo, showError)}
        secondary
        content='Delete container'
      />
      <Button onClick={() => fileInput && fileInput.click()} content='Select and upload files' />
      <Button
        onClick={() => fileListRef.current && listFiles(fileListRef.current, containerURL, showInfo, showError)}
        content='List files'
      />
      <Button
        onClick={() => fileListRef.current && deleteFiles(fileListRef.current, containerURL, showInfo, showError)}
        secondary
        content='Delete selected files'
      />
      <Header as='h2' content='Files:' />
      <input
        type='file'
        ref={e => (fileInput = e)}
        onChange={() =>
          fileInput &&
          fileListRef.current &&
          uploadFiles(fileInput.files, fileListRef.current, containerURL, showInfo, showError)
        }
        multiple
        style={{ display: 'none' }}
      />
      <select ref={fileListRef} multiple style={{ height: '222px', width: '593px', overflowY: 'scroll' }} />
    </Segment>
  );
};
