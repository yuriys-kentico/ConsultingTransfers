import { Link } from '@reach/router';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Header, Loader, Segment, Table } from 'semantic-ui-react';

import { AzureFunctions, getTransfersUrl, getTransferUrl, ITransfer } from '../../../connectors/AzureFunctions';
import { AppContext } from '../../AppContext';
import { RoutedFC } from '../../RoutedFC';
import { AppHeaderContext } from '../../shared/header/AppHeaderContext';
import { AuthenticatedContext } from '../AuthenticatedContext';

export const Transfers: RoutedFC = () => {
  const { terms, azureStorage } = useContext(AppContext);
  const appHeaderContext = useContext(AppHeaderContext);
  const { authProvider } = useContext(AuthenticatedContext);

  const [transfers, setTransfers] = useState<ITransfer[]>([]);

  useEffect(() => {
    const { accountName, listTransfers } = azureStorage;

    AzureFunctions.listTransfers(accountName, listTransfers, authProvider, appHeaderContext).then(
      transfers => transfers && setTransfers(transfers)
    );
  }, [authProvider, azureStorage, appHeaderContext]);

  const { header, table } = terms.admin.transfers;

  return (
    <Segment basic>
      <Header as='h2'>{header}</Header>
      <Table stackable singleLine basic='very'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{table.transfer}</Table.HeaderCell>
            <Table.HeaderCell>{table.account}</Table.HeaderCell>
            <Table.HeaderCell>{table.requester}</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {transfers.length === 0 ? (
            <Table.Row>
              <Table.Cell>
                <Loader active size='massive' />
              </Table.Cell>
            </Table.Row>
          ) : (
            transfers.map((item, index) => (
              <Table.Row key={index}>
                <Table.Cell>{item.system.name}</Table.Cell>
                <Table.Cell>{item.customer}</Table.Cell>
                <Table.Cell>{item.requester}</Table.Cell>
                <Table.Cell textAlign='right'>
                  <Button circular icon='edit' as={Link} to={getTransfersUrl(item.containerToken)} />
                  <Button circular icon='share square' as={Link} to={getTransferUrl(item.containerToken)} />
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    </Segment>
  );
};
