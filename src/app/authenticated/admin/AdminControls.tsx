import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC, useContext, useEffect, useState } from 'react';
import { Button, Divider, Header, List, Placeholder, Segment } from 'semantic-ui-react';
import { AppHeaderContext } from '../../shared/header/AppHeaderContext';
import {
  createContainer,
  deleteContainer,
  deleteFile,
  deleteFiles,
  downloadFile,
  getFiles,
  useContainer
} from '../../shared/transfers/azure/azureStorage';
import { BlobDetails } from '../../shared/transfers/BlobDetails';
import { TransferContext } from '../../shared/transfers/TransferContext';

export const AdminControls: FC = () => {
  const appHeaderContext = useContext(AppHeaderContext);
  const { item } = useContext(TransferContext);

  const { containerName, containerURL } = useContainer(item.system.codename);

  const [files, setFiles] = useState<BlobItem[]>();
  const [selectedFiles, setSelectedFiles] = useState<BlobItem[]>([]);

  useEffect(() => {
    getFiles(containerURL, appHeaderContext).then(files => setFiles(files));
  }, []);

  return (
    <div>
      <Divider />
      <Segment>
        <Header as='h2' content='Details:' />
        <List>
          <Header as='h4' content='Container name:' subheader={containerName} />
          <Header as='h4'>
            Container URL:
            <Header.Subheader>
              <a href={containerURL.url}>{containerURL.url}</a>
            </Header.Subheader>
          </Header>
        </List>
      </Segment>
      {!files ? (
        <Placeholder>
          <Placeholder.Header>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
        </Placeholder>
      ) : (
        <Segment>
          <Header as='h2' content='Files:' />
          <List>
            {files.map((file, index) => (
              <List.Item key={index} className='padding bottom'>
                <List.Content floated='right'>
                  <Button
                    circular
                    icon={selectedFiles.indexOf(file) > -1 ? 'check square outline' : 'square outline'}
                    onClick={() => setSelectedFiles([...selectedFiles, file])}
                  />
                  <Button circular icon='download' onClick={() => downloadFile(file, containerURL, appHeaderContext)} />
                  <Button
                    circular
                    icon='trash'
                    onClick={() =>
                      deleteFile(file, containerURL, appHeaderContext).then(() =>
                        setFiles(files => {
                          files && delete files[files.indexOf(file)];
                          return files;
                        })
                      )
                    }
                  />
                </List.Content>
                <List.Content>
                  <BlobDetails file={file} />
                </List.Content>
              </List.Item>
            ))}
          </List>
        </Segment>
      )}
      <Divider hidden />
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
        onClick={() => deleteFiles(selectedFiles, containerURL, appHeaderContext)}
        negative
        content='Delete selected files'
      />
    </div>
  );
};
