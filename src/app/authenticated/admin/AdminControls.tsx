import { FC, useRef, useContext } from 'react';
import React from 'react';
import { Divider, Header, Button } from 'semantic-ui-react';
import {
  useContainer,
  createContainer,
  deleteContainer,
  listFiles,
  deleteFiles
} from '../../transfers/azure/azureStorage';
import { AppHeaderContext } from '../../header/AppHeaderContext';
import { TransferContext } from '../../transfers/TransferContext';

export const AdminControls: FC = () => {
  const appHeaderContext = useContext(AppHeaderContext);
  const transferContext = useContext(TransferContext);

  const fileList = useRef<HTMLSelectElement>(null);

  const { containerName, containerURL } = useContainer(transferContext.item.system.codename);

  return (
    <div>
      <Divider hidden />
      <Header as='h2' content='Files:' />
      <select ref={fileList} multiple className='file list' />
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
  );
};
