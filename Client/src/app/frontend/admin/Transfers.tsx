import { Link } from '@reach/router';
import React, { useContext, useEffect } from 'react';
import { Button, Header, Loader, Segment, Table } from 'semantic-ui-react';

import { IAzureFunctionsService } from '../../../services/azureFunctions/AzureFunctionsService';
import { useDependency } from '../../../services/dependencyContainer';
import { admin } from '../../../terms.en-us.json';
import { useSubscription } from '../../../utilities/observables';
import { authenticated, AuthenticatedRoutedFC, getTransferUrl, setTitle } from '../../../utilities/routing';
import { MessageContext } from '../header/MessageContext';

export const Transfers: AuthenticatedRoutedFC = authenticated(() => {
  const azureFunctionsService = useDependency(IAzureFunctionsService);
  azureFunctionsService.messageContext = useContext(MessageContext);

  useEffect(() => {
    azureFunctionsService.listTransfers();
  }, [azureFunctionsService]);

  const transfers = useSubscription(azureFunctionsService.transfers);

  const { header, table } = admin.transfers;

  setTitle(header);

  return (
    <Segment basic>
      <Header as='h2'>{header}</Header>
      <Table unstackable singleLine basic='very'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{table.region}</Table.HeaderCell>
            <Table.HeaderCell>{table.transfer}</Table.HeaderCell>
            <Table.HeaderCell>{table.customer}</Table.HeaderCell>
            <Table.HeaderCell>{table.requester}</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {!transfers ? (
            <Table.Row>
              <Table.Cell>
                <Loader active size='massive' />
              </Table.Cell>
            </Table.Row>
          ) : (
            transfers.map((transfer, index) => (
              <Table.Row key={index}>
                <Table.Cell>{transfer.region.toUpperCase()}</Table.Cell>
                <Table.Cell>{transfer.name}</Table.Cell>
                <Table.Cell>{transfer.customer}</Table.Cell>
                <Table.Cell>{transfer.requester}</Table.Cell>
                <Table.Cell textAlign='right'>
                  <Button circular icon='edit' as={Link} to={getTransferUrl(transfer.transferToken)} />
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    </Segment>
  );
});
