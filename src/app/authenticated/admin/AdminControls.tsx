import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC, useContext, useState } from 'react';
import { Button, Divider, Header, List, Segment, Table } from 'semantic-ui-react';

import { deleteFrom } from '../../../utilities/arrays';
import { useContainer } from '../../shared/transfers/azure/azureStorage';
import { BlobDetails } from '../../shared/transfers/BlobDetails';
import { TransferContext } from '../../shared/transfers/TransferContext';

export const AdminControls: FC = () => {
  const { request, blobs, downloadBlob, deleteBlobs, createContainer, deleteContainer } = useContext(TransferContext);
  const { containerName, containerURL } = useContainer(request.system.codename);
  const [selectedBlobs, setSelectedBlobs] = useState<BlobItem[]>([]);

  const toggleSelectedBlob = (blob: BlobItem) => {
    selectedBlobs.indexOf(blob) > -1
      ? setSelectedBlobs(selectedBlobs => [...deleteFrom(blob, selectedBlobs)])
      : setSelectedBlobs(selectedBlobs => [...selectedBlobs, blob]);
  };

  for (const blob of selectedBlobs) {
    const blobIndex = blobs.indexOf(blob);
    if (blobIndex === -1) {
      toggleSelectedBlob(blob);
    }
  }

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
      <Segment>
        <Header as='h2' content='Files:' />
        <Table stackable singleLine basic='very' compact>
          <Table.Body>
            {blobs.map((file, index) => (
              <Table.Row key={index}>
                <Table.Cell collapsing><Button
                  circular
                  icon={selectedBlobs.indexOf(file) > -1 ? 'check circle outline' : 'circle outline'}
                  compact
                  onClick={() => toggleSelectedBlob(file)}
                /></Table.Cell>

                <Table.Cell><BlobDetails file={file} /></Table.Cell>
                <Table.Cell textAlign='right'><Button circular icon='download' onClick={() => downloadBlob(file, containerURL)} />
                  <Button circular icon='trash' onClick={() => deleteBlobs(file, containerURL)} /></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Segment>
      <Divider hidden />
      <Button
        onClick={() => deleteBlobs(selectedBlobs, containerURL)}
        disabled={selectedBlobs.length === 0}
        negative
        content='Delete selected files'
      />
      <Button
        onClick={() => deleteContainer(containerName, containerURL)}
        negative
        floated='right'
        content='Delete container'
      />
      <Button onClick={() => createContainer(containerName, containerURL)} floated='right' content='Create container' />
    </div>
  );
};
