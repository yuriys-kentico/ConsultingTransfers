import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC, useContext, useState } from 'react';
import { Subject } from 'rxjs';
import { Button, Divider, Header, Label, List, Segment, Table } from 'semantic-ui-react';

import { IAzureFunctionsService } from '../../../services/azureFunctions/AzureFunctionsService';
import { completed } from '../../../services/azureStorage/azureStorage';
import { IAzureStorageService } from '../../../services/azureStorage/AzureStorageService';
import { useDependency } from '../../../services/dependencyContainer';
import { deleteFrom } from '../../../utilities/arrays';
import { toRounded } from '../../../utilities/numbers';
import { useSubscription } from '../../../utilities/observables';
import { promiseAfter } from '../../../utilities/promises';
import { MessageContext } from '../header/MessageContext';
import { IUpdateMessage } from '../header/snacks';
import { BlobDetails } from './BlobDetails';

export const Debug: FC = () => {
  const [selectedBlobs, setSelectedBlobs] = useState<BlobItem[]>([]);

  const toggleSelectedBlob = (blob: BlobItem) => {
    selectedBlobs.indexOf(blob) > -1
      ? setSelectedBlobs(selectedBlobs => deleteFrom(blob, selectedBlobs))
      : setSelectedBlobs(selectedBlobs => [...selectedBlobs, blob]);
  };

  const azureStorageService = useDependency(IAzureStorageService);
  azureStorageService.messageContext = useContext(MessageContext);
  const blobs = useSubscription(azureStorageService.blobs);

  for (const blob of selectedBlobs) {
    const blobIndex = blobs && blobs.indexOf(blob);
    if (blobIndex === -1) {
      toggleSelectedBlob(blob);
    }
  }

  const azureFunctionService = useDependency(IAzureFunctionsService);
  const transfer = useSubscription(azureFunctionService.transfer);

  const { showInfoUntil } = useContext(MessageContext);

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

  return !transfer ? null : (
    <>
      <Divider />
      <Segment>
        <Header as='h2' content={'Details:'} />
        <List>
          <List.Item>
            <Label horizontal content={'Container name:'} />
            {transfer.containerName}
          </List.Item>
          <List.Item>
            <Label horizontal content={'Customer:'} />
            {transfer.customer}
          </List.Item>
          <List.Item>
            <Label horizontal content={'Requester:'} />
            {transfer.requester}
          </List.Item>
        </List>
      </Segment>
      <Segment>
        <Header as='h2' content='Files:' />
        <Table unstackable singleLine basic='very' compact>
          <Table.Body>
            {blobs &&
              blobs.map((blob, index) => (
                <Table.Row key={index}>
                  <Table.Cell collapsing>
                    <Button
                      onClick={() => toggleSelectedBlob(blob)}
                      icon={selectedBlobs.indexOf(blob) > -1 ? 'check circle outline' : 'circle outline'}
                      circular
                      compact
                      basic
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <BlobDetails
                      file={blob}
                      fileName={blob.name}
                      color={blob.name.endsWith(completed) ? 'green' : 'black'}
                    />
                  </Table.Cell>
                  <Table.Cell textAlign='right'>
                    <Button
                      onClick={() => azureStorageService.downloadBlob(blob)}
                      icon='download'
                      color='green'
                      circular
                    />
                    <Button onClick={() => azureStorageService.deleteBlobs(blob)} icon='trash' negative circular />
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      </Segment>
      <Divider hidden />
      <Button
        onClick={() => azureStorageService.downloadBlobs(selectedBlobs)}
        disabled={selectedBlobs.length === 0}
        icon='download'
        color='green'
      />
      <Button
        onClick={() => azureStorageService.deleteBlobs(selectedBlobs)}
        disabled={selectedBlobs.length === 0}
        icon='trash'
        negative
      />
      <Button
        onClick={() => blobs && setSelectedBlobs(blobs)}
        disabled={blobs && selectedBlobs.length === blobs.length}
        content='Select all'
      />
      <Button
        onClick={() =>
          window.confirm('Are you sure you want to delete the container?') &&
          azureStorageService.deleteContainer(transfer.containerName)
        }
        floated='right'
        icon='trash'
        negative
        content='Container'
      />
      {/* <Button
        onClick={() => azureStorageService.createContainer(transfer.containerName)}
        floated='right'
        content='Create container'
      /> */}
      <Button onClick={() => showRandomSnack()} floated='right' content='Show random snack' />
    </>
  );
};
