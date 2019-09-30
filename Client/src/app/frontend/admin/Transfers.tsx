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
            <Table.HeaderCell>{table.transfer}</Table.HeaderCell>
            <Table.HeaderCell>{table.customer}</Table.HeaderCell>
            <Table.HeaderCell>{table.requester}</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {!(transfers && transfers.length > 0) ? (
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
                  <Button circular icon='edit' as={Link} to={getTransferUrl(item.containerToken)} />
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    </Segment>
  );
});
