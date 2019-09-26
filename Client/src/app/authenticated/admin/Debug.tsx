import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC, useContext, useState } from 'react';
import { Button, Divider, Header, Label, List, Segment, Table } from 'semantic-ui-react';

import { IAzureFunctionsService } from '../../../services/azureFunctions/AzureFunctionsService';
import { completed } from '../../../services/azureStorage/azureStorage';
import { IAzureStorageService } from '../../../services/azureStorage/AzureStorageService';
import { useDependency } from '../../../services/dependencyContainer';
import { deleteFrom } from '../../../utilities/arrays';
import { useSubscription } from '../../../utilities/observables';
import { MessageContext } from '../../shared/header/MessageContext';
import { BlobDetails } from '../../shared/transfer/BlobDetails';

export const Debug: FC = () => {
  const [selectedBlobs, setSelectedBlobs] = useState<BlobItem[]>([]);

  const toggleSelectedBlob = (blob: BlobItem) => {
    selectedBlobs.indexOf(blob) > -1
      ? setSelectedBlobs(selectedBlobs => [...deleteFrom(blob, selectedBlobs)])
      : setSelectedBlobs(selectedBlobs => [...selectedBlobs, blob]);
  };

  const azureStorageService = useDependency(IAzureStorageService);
  azureStorageService.messageHandlers = useContext(MessageContext);

  const blobs = useSubscription(azureStorageService.blobs);

  for (const blob of selectedBlobs) {
    const blobIndex = blobs && blobs.indexOf(blob);
    if (blobIndex === -1) {
      toggleSelectedBlob(blob);
    }
  }

  const azureFunctionService = useDependency(IAzureFunctionsService);
  const transferDetails = useSubscription(azureFunctionService.transferDetails);

  // const { showInfoUntil } = useContext(MessageContext);

  //   const showRandomSnack = () => {
  //     const getRandomInt = (min: number, max: number) => {
  //       return toRounded(Math.random() * (max - min) + min);
  //     };

  //     const totalTime = getRandomInt(1000, 15000);
  //     const totalUpdates = 20;
  //     const updater = new Subject<IUpdateMessage>();
  //     let progress = 0;

  //     const interval = setInterval(() => {
  //       progress += 100 / totalUpdates;

  //       updater.next({
  //         current: progress,
  //         total: 100
  //       });

  //       if (progress === 100) {
  //         clearInterval(interval);
  //       }
  //     }, totalTime / totalUpdates);

  //     showInfoUntil(`test ${totalTime}`, promiseAfter(totalTime)(''), updater);
  //   };

  return !transferDetails ? null : (
    <>
      <Divider />
      <Segment>
        <Header as='h2' content={'Details:'} />
        <List>
          <List.Item>
            <Label horizontal content={'Container name:'} />
            {transferDetails.containerName}
          </List.Item>
          <List.Item>
            <Label horizontal content={'Customer:'} />
            {transferDetails.transfer.customer}
          </List.Item>
          <List.Item>
            <Label horizontal content={'Requester:'} />
            {transferDetails.transfer.requester}
          </List.Item>
        </List>
      </Segment>
      <Segment>
        <Header as='h2' content='Files:' />
        <Table stackable singleLine basic='very' compact>
          <Table.Body>
            {blobs &&
              blobs.map((file, index) => (
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
                      color={file.name.endsWith(completed) ? 'green' : 'black'}
                    />
                  </Table.Cell>
                  <Table.Cell textAlign='right'>
                    <Button circular icon='download' onClick={() => azureStorageService.downloadBlob(file)} />
                    <Button circular icon='trash' onClick={() => azureStorageService.deleteBlobs(file)} />
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      </Segment>
      <Divider hidden />
      <Button
        onClick={() => azureStorageService.deleteBlobs(selectedBlobs)}
        disabled={selectedBlobs.length === 0}
        negative
        content={'Delete selected files'}
      />
      <Button
        onClick={() => azureStorageService.deleteContainer(transferDetails.containerName)}
        negative
        floated='right'
        content={'Delete container'}
      />
      <Button
        onClick={() => azureStorageService.createContainer(transferDetails.containerName)}
        floated='right'
        content={'Create container'}
      />
      {/* <Button onClick={() => showRandomSnack()} floated='right' content='Show random snack' /> */}
    </>
  );
};
