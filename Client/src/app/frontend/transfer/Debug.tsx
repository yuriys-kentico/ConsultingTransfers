import React, { FC, useContext, useEffect, useState } from 'react';
import { Button, Divider, Header, Label, List, Segment, Table } from 'semantic-ui-react';

import { useDependency } from '../../../services/dependencyContainer';
import { IFile } from '../../../services/models/IFile';
import { ITransferFilesService } from '../../../services/TransferFilesService';
import { ITransfersService } from '../../../services/TransfersService';
import { transfer as transferTerms } from '../../../terms.en-us.json';
import { useSubscription } from '../../../utilities/observables';
import { Tooltip } from '../../shared/Tooltip';
import { MessageContext } from '../header/MessageContext';
import { BlobDetails } from './BlobDetails';

interface IFileListItem {
  file: IFile;
  selected: boolean;
}

export const Debug: FC = () => {
  const messageContext = useContext(MessageContext);

  const transferFilesService = useDependency(ITransferFilesService);
  transferFilesService.messageContext = messageContext;
  const files = useSubscription(transferFilesService.files);

  const transfersService = useDependency(ITransfersService);
  const transfer = useSubscription(transfersService.transfer);

  const [ready, setReady] = useState(false);
  const [filesList, setFilesList] = useState<IFileListItem[]>([]);

  useEffect(() => {
    if (files) {
      setFilesList(files.map(file => ({ file, selected: false })));
      setReady(true);
    }
  }, [files]);

  // const { showInfoUntil } = messageContext;

  // const showRandomSnack = () => {
  //   const getRandomInt = (min: number, max: number) => {
  //     return toRounded(Math.random() * (max - min) + min);
  //   };

  //   const totalTime = getRandomInt(1000, 15000);
  //   const totalUpdates = 20;
  //   const updater = new Subject<IUpdateMessage>();
  //   let progress = 0;

  //   const interval = setInterval(() => {
  //     progress += 100 / totalUpdates;

  //     updater.next({
  //       current: progress,
  //       total: 100
  //     });

  //     if (progress === 100) {
  //       clearInterval(interval);
  //     }
  //   }, totalTime / totalUpdates);

  //   showInfoUntil(`test ${totalTime}`, wait(totalTime), updater);
  // };

  return (
    <>
      {ready && transfer && (
        <>
          <Divider />
          <Segment>
            <Header as='h2' content={'Info:'} />
            <List>
              <List.Item>
                <Label horizontal content={'Customer:'} />
                {transfer.customer}
              </List.Item>
              <List.Item>
                <Label horizontal content={'Requester:'} />
                {transfer.requester}
              </List.Item>
              <List.Item>
                <Label horizontal content={'Container name:'} />
                {transferFilesService.containerClient.containerName}
              </List.Item>
            </List>
          </Segment>
          <Segment>
            <Header as='h2' content='Files:' />
            <Table unstackable singleLine basic='very' compact>
              <Table.Body>
                {filesList.map((fileListItem, index) => (
                  <Table.Row key={index}>
                    <Table.Cell collapsing>
                      <Button
                        onClick={() => {
                          filesList[index].selected = !filesList[index].selected;
                          setFilesList([...filesList]);
                        }}
                        icon={`${fileListItem.selected ? 'check ' : ''}circle outline`}
                        circular
                        compact
                        basic
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <BlobDetails file={fileListItem.file} />
                    </Table.Cell>
                    <Table.Cell>
                      {fileListItem.file.field.completed
                        ? `${fileListItem.file.field.name} (${fileListItem.file.field.type}): completed`
                        : `${fileListItem.file.field.name} (${fileListItem.file.field.type})`}
                    </Table.Cell>
                    <Table.Cell textAlign='right'>
                      <Tooltip text={transferTerms.tooltips.downloadFile}>
                        <Button
                          onClick={() => transferFilesService.downloadFiles(fileListItem.file)}
                          icon='download'
                          color='green'
                          circular
                        />
                      </Tooltip>
                      <Tooltip text={transferTerms.tooltips.deleteFile}>
                        <Button
                          onClick={() => transferFilesService.deleteFiles(fileListItem.file)}
                          icon='trash'
                          color='red'
                        />
                      </Tooltip>
                    </Table.Cell>
                  </Table.Row>
                ))}
                <Table.Row>
                  <Table.Cell colSpan='3'>
                    <Button
                      onClick={() => {
                        const someDeselected = filesList.some(blobListItem => !blobListItem.selected);
                        filesList.forEach(innerBlobListItem => (innerBlobListItem.selected = someDeselected));
                        setFilesList([...filesList]);
                      }}
                      content={filesList.some(blobListItem => !blobListItem.selected) ? 'Select all' : 'Deselect all'}
                    />
                  </Table.Cell>
                  <Table.Cell textAlign='right'>
                    <Tooltip text={transferTerms.tooltips.downloadSelectedFiles}>
                      <Button
                        onClick={() =>
                          transferFilesService.downloadFiles(
                            filesList
                              .filter(blobListItem => blobListItem.selected)
                              .map(blobsListItem => blobsListItem.file)
                          )
                        }
                        disabled={!filesList.some(blobListItem => blobListItem.selected)}
                        icon='download'
                        color='green'
                        circular
                      />
                    </Tooltip>
                    <Tooltip text={transferTerms.tooltips.deleteSelectedFiles}>
                      <Button
                        onClick={() =>
                          transferFilesService.deleteFiles(
                            filesList
                              .filter(blobListItem => blobListItem.selected)
                              .map(blobsListItem => blobsListItem.file)
                          )
                        }
                        disabled={!filesList.some(blobListItem => blobListItem.selected)}
                        icon='trash'
                        color='red'
                      />
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </Segment>
          {/* <Button onClick={() => showRandomSnack()} floated='right' content='Show random snack' /> */}
        </>
      )}
    </>
  );
};
