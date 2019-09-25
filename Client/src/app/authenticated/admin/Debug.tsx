import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC, useContext, useEffect, useState } from 'react';
import { Button, Divider, Header, Label, List, Segment, Table } from 'semantic-ui-react';

import { AzureStorageHelper } from '../../../services/azureStorage/AzureStorageHelper';
import { IAzureStorageService } from '../../../services/azureStorage/AzureStorageService';
import { useDependency } from '../../../services/dependencyContainer';
import { deleteFrom } from '../../../utilities/arrays';
import { BlobDetails } from '../../shared/transfer/BlobDetails';
import { TransferContext } from '../../shared/transfer/TransferContext';

interface IAdminControlsProps {
  containerName: string;
}

export const Debug: FC<IAdminControlsProps> = ({ containerName }) => {
  const { transfer, downloadBlob, deleteBlobs, createContainer, deleteContainer } = useContext(TransferContext);
  const [selectedBlobs, setSelectedBlobs] = useState<BlobItem[]>([]);
  const [blobsStream, setBlobsStream] = useState<BlobItem[]>([]);

  const toggleSelectedBlob = (blob: BlobItem) => {
    selectedBlobs.indexOf(blob) > -1
      ? setSelectedBlobs(selectedBlobs => [...deleteFrom(blob, selectedBlobs)])
      : setSelectedBlobs(selectedBlobs => [...selectedBlobs, blob]);
  };

  for (const blob of selectedBlobs) {
    const blobIndex = blobsStream.indexOf(blob);
    if (blobIndex === -1) {
      toggleSelectedBlob(blob);
    }
  }

  const azureStorageService = useDependency(IAzureStorageService);

  useEffect(() => {
    const sub = azureStorageService.blobs.subscribe({
      next: blobs => {
        console.log(blobs);

        setBlobsStream(blobs);
      }
    });

    return () => sub.unsubscribe();
  }, [azureStorageService.blobs]);

  // const { showInfoUntil } = useContext(AppHeaderContext);

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

  return (
    <>
      <Divider />
      <Segment>
        <Header as='h2' content={'Details:'} />
        <List>
          <List.Item>
            <Label horizontal content={'Container name:'} />
            {containerName}
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
        <Table stackable singleLine basic='very' compact>
          <Table.Body>
            {blobsStream.map((file, index) => (
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
                    color={file.name.endsWith(AzureStorageHelper.completed) ? 'green' : 'black'}
                  />
                </Table.Cell>
                <Table.Cell textAlign='right'>
                  <Button circular icon='download' onClick={() => downloadBlob(file)} />
                  <Button circular icon='trash' onClick={() => deleteBlobs(file)} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Segment>
      <Divider hidden />
      <Button
        onClick={() => deleteBlobs(selectedBlobs)}
        disabled={selectedBlobs.length === 0}
        negative
        content={'Delete selected files'}
      />
      <Button onClick={() => deleteContainer(containerName)} negative floated='right' content={'Delete container'} />
      <Button onClick={() => createContainer(containerName)} floated='right' content={'Create container'} />
      {/* <Button onClick={() => showRandomSnack()} floated='right' content='Show random snack' /> */}
    </>
  );
};
