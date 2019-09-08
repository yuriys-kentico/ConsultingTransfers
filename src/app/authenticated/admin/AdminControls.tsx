import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC, useContext, useState } from 'react';
import { Button, Divider, Header, Label, List, Segment, Table } from 'semantic-ui-react';

import { AzureStorage, useContainer } from '../../../connectors/azure/azureStorage';
import { deleteFrom } from '../../../utilities/arrays';
import { AppContext } from '../../AppContext';
import { BlobDetails } from '../../shared/transfer/BlobDetails';
import { TransferContext } from '../../shared/transfer/TransferContext';

export const AdminControls: FC = () => {
  const {
    terms: {
      admin: { controls }
    }
  } = useContext(AppContext);
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
        <Header as='h2' content={controls.details} />
        <List>
          <List.Item>
            <Label horizontal>{controls.containerName}</Label>
            {containerName}
          </List.Item>
        </List>
      </Segment>
      <Segment>
        <Header as='h2' content='Files:' />
        <Table stackable singleLine basic='very' compact>
          <Table.Body>
            {blobs.map((file, index) => (
              <Table.Row key={index}>
                <Table.Cell collapsing>
                  <Button
                    circular
                    icon={selectedBlobs.indexOf(file) > -1 ? 'check circle outline' : 'circle outline'}
                    compact
                    onClick={() => toggleSelectedBlob(file)}
                  />
                </Table.Cell>

                <Table.Cell>
                  <BlobDetails
                    file={file}
                    fileName={file.name}
                    color={file.name.endsWith(AzureStorage.completed) ? 'green' : 'black'}
                  />
                </Table.Cell>
                <Table.Cell textAlign='right'>
                  <Button circular icon='download' onClick={() => downloadBlob(file, containerURL)} />
                  <Button circular icon='trash' onClick={() => deleteBlobs(file, containerURL)} />
                </Table.Cell>
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
        content={controls.deleteSelected}
      />
      <Button
        onClick={() => deleteContainer(containerName, containerURL)}
        negative
        floated='right'
        content={controls.deleteContainer}
      />
      <Button
        onClick={() => createContainer(containerName, containerURL)}
        floated='right'
        content={controls.createContainer}
      />
    </div>
  );
};
