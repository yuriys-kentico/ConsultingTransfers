import { FC, useRef, useContext } from 'react';
import React from 'react';
import { Divider, Header, Button, List } from 'semantic-ui-react';
import { AppHeaderContext } from '../../shared/header/AppHeaderContext';
import { TransferContext } from '../../shared/transfers/TransferContext';
import {
  useContainer,
  createContainer,
  deleteContainer,
  listFiles,
  deleteFiles
} from '../../shared/transfers/azure/azureStorage';

export const AdminControls: FC = () => {
  const appHeaderContext = useContext(AppHeaderContext);
  const transferContext = useContext(TransferContext);

  const fileList = useRef<HTMLSelectElement>(null);

  const { containerName, containerURL } = useContainer(transferContext.item.system.codename);

  return (
    <div>
      <Divider hidden />
      <List>
        <List.Item>Container name: {containerName}</List.Item>
        <List.Item>Container URL: {containerURL.url}</List.Item>
      </List>
      <Header as='h2' content='Files:' />
      <select ref={fileList} multiple className='file list' />
      <Divider />
      <Button
        onClick={() => createContainer(containerName, containerURL, appHeaderContext)}
        content='Create container'
      />
      <Button
        onClick={() => deleteContainer(containerName, containerURL, appHeaderContext)}
        negative
        content='Delete container'
      />
      <Button
        onClick={() => fileList.current && listFiles(fileList.current, containerURL, appHeaderContext)}
        content='List files'
      />
      <Button
        onClick={() => fileList.current && deleteFiles(fileList.current, containerURL, appHeaderContext)}
        negative
        content='Delete selected files'
      />
    </div>
  );
};
