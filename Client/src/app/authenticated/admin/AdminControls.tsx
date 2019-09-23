import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC, useContext, useState } from 'react';
import { Subject } from 'rxjs';
import { Button, Divider, Header, Label, List, Segment, Table } from 'semantic-ui-react';

import { AzureStorage } from '../../../connectors/azure/azureStorage';
import { deleteFrom } from '../../../utilities/arrays';
import { toRounded } from '../../../utilities/numbers';
import { promiseAfter } from '../../../utilities/promises';
import { AppContext } from '../../AppContext';
import { AppHeaderContext } from '../../shared/header/AppHeaderContext';
import { IUpdateMessage } from '../../shared/header/Snack';
import { BlobDetails } from '../../shared/transfer/BlobDetails';
import { TransferContext } from '../../shared/transfer/TransferContext';

export const AdminControls: FC = () => {
  const { controls } = useContext(AppContext).terms.admin;
  const {
    containerName,
    containerURL,
    requestItem,
    blobs,
    downloadBlob,
    deleteBlobs,
    createContainer,
    deleteContainer
  } = useContext(TransferContext);
  const [selectedBlobs, setSelectedBlobs] = useState<BlobItem[]>([]);

  const { showInfoUntil } = useContext(AppHeaderContext);

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

  const showRandomSnack = () => {
    const getRandomInt = (min: number, max: number) => {
      return toRounded(Math.random() * (max - min) + min);
    };

    const totalTime = getRandomInt(1000, 15000);
    const totalUpdates = 20;
    const updater = new Subject<IUpdateMessage>();
    let progress = 0;

    const interval = setInterval(() => {
      progress += 100 / totalUpdates;

      updater.next({
        current: progress,
        total: 100
      });

      if (progress === 100) {
        clearInterval(interval);
      }
    }, totalTime / totalUpdates);

    showInfoUntil(`test ${totalTime}`, promiseAfter(totalTime)(''), updater);
  };

  return (
    <>
      <Divider />
      <Segment>
        <Header as='h2' content={controls.details.header} />
        <List>
          <List.Item>
            <Label horizontal>{controls.details.containerName}</Label>
            {containerName}
          </List.Item>
          <List.Item>
            <Label horizontal>{controls.details.crmAccountName}</Label>
            {requestItem.crmAccountName}
          </List.Item>
          <List.Item>
            <Label horizontal>{controls.details.requester}</Label>
            {requestItem.requester}
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
      {/* <Button onClick={() => showRandomSnack()} floated='right' content='Show random snack' /> */}
    </>
  );
};
