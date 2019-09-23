import { BlobItem } from '@azure/storage-blob/typings/src/generated/src/models';
import React, { FC, useContext, useState } from 'react';
import { Button, Divider, Header, Label, List, Segment, Table } from 'semantic-ui-react';

import { AzureStorage, IAzureStorageOptions } from '../../../connectors/AzureStorage';
import { deleteFrom } from '../../../utilities/arrays';
import { AppContext } from '../../AppContext';
import { BlobDetails } from '../../shared/transfer/BlobDetails';
import { TransferContext } from '../../shared/transfer/TransferContext';

interface IAdminControlsProps {
  azureStorageOptions: IAzureStorageOptions;
}

export const AdminControls: FC<IAdminControlsProps> = ({ azureStorageOptions }) => {
  const { controls } = useContext(AppContext).terms.admin;
  const { transfer, blobs, downloadBlob, deleteBlobs, createContainer, deleteContainer } = useContext(TransferContext);
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
        <Header as='h2' content={controls.details.header} />
        <List>
          <List.Item>
            <Label horizontal>{controls.details.containerName}</Label>
            {azureStorageOptions.containerName}
          </List.Item>
          <List.Item>
            <Label horizontal>{controls.details.customer}</Label>
            {transfer.customer}
          </List.Item>
          <List.Item>
            <Label horizontal>{controls.details.requester}</Label>
            {transfer.requester}
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
        content={controls.deleteSelected}
      />
      <Button onClick={() => deleteContainer()} negative floated='right' content={controls.deleteContainer} />
      <Button onClick={() => createContainer()} floated='right' content={controls.createContainer} />
      {/* <Button onClick={() => showRandomSnack()} floated='right' content='Show random snack' /> */}
    </>
  );
};
