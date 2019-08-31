import React, { useState, useEffect, useContext, useRef } from 'react';
import { RoutedFC } from '../RoutedFC';
import { AppContext } from '../AppContext';
import { DeliveryClient, ContentItem } from 'kentico-cloud-delivery';
import { Loading } from './Loading';
import { Header, Segment, Button, Divider } from 'semantic-ui-react';
import { AppHeaderContext } from '../header/AppHeaderContext';
import {
  createContainer,
  deleteContainer,
  listFiles,
  deleteFiles,
  uploadFiles,
  useContainer
} from '../../utilities/azureStorage';

export interface ITransferProps {
  urlSlug: string;
  authenticated: boolean;
}

export const Transfer: RoutedFC<ITransferProps> = props => {
  const appContext = useContext(AppContext);

  const appHeaderContext = useContext(AppHeaderContext);

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

  const fileInput = useRef<HTMLInputElement>(null);

  const fileList = useRef<HTMLSelectElement>(null);

  const { containerName, containerURL } = useContainer();

  function renderFields(item: ContentItem | undefined) {
    return !item ? (
      <Loading />
    ) : (
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

  return (
    <Segment basic>
      {renderFields(item)}
      <Divider />

      <Button onClick={() => fileInput.current && fileInput.current.click()} content='Select and upload files' />
      <Header as='h2' content='Files:' />
      <input
        type='file'
        ref={fileInput}
        onChange={() => {
          fileInput.current &&
            fileList.current &&
            uploadFiles(fileInput.current, fileList.current, containerURL, appHeaderContext);
        }}
        multiple
        style={{ display: 'none' }}
      />
      <select ref={fileList} multiple style={{ height: '222px', width: '593px', overflowY: 'scroll' }} />
      {props.authenticated && (
        <div>
          <Divider />
          <Button
            onClick={() => createContainer(containerName, containerURL, appHeaderContext)}
            content='Create container'
          />
          <Button
            onClick={() => deleteContainer(containerName, containerURL, appHeaderContext)}
            secondary
            content='Delete container'
          />
          <Button
            onClick={() => fileList.current && listFiles(fileList.current, containerURL, appHeaderContext)}
            content='List files'
          />
          <Button
            onClick={() => fileList.current && deleteFiles(fileList.current, containerURL, appHeaderContext)}
            secondary
            content='Delete selected files'
          />
        </div>
      )}
    </Segment>
  );
};
