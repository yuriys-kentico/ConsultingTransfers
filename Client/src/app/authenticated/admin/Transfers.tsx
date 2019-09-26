import { Link } from '@reach/router';
import React, { useContext, useEffect } from 'react';
import { Button, Header, Loader, Segment, Table } from 'semantic-ui-react';

import { terms } from '../../../appSettings.json';
import { getTransfersUrl, getTransferUrl } from '../../../services/azureFunctions/azureFunctions';
import { IAzureFunctionsService } from '../../../services/azureFunctions/AzureFunctionsService';
import { useDependency } from '../../../services/dependencyContainer';
import { useSubscription } from '../../../utilities/observables';
import { RoutedFC } from '../../RoutedFC';
import { MessageContext } from '../../shared/header/MessageContext';
import { AuthenticatedContext } from '../AuthenticatedContext';

export const Transfers: RoutedFC = () => {
  const messageContext = useContext(MessageContext);
  const { authProvider } = useContext(AuthenticatedContext);

  const azureFunctionsService = useDependency(IAzureFunctionsService);

  useEffect(() => {
    azureFunctionsService.listTransfers(authProvider, messageContext);
  }, [azureFunctionsService, authProvider, messageContext]);

  const transfers = useSubscription(azureFunctionsService.transfers);

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
          {transfers && transfers.length === 0 ? (
            <Table.Row>
              <Table.Cell>
                <Loader active size='massive' />
              </Table.Cell>
            </Table.Row>
          ) : (
            transfers &&
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
