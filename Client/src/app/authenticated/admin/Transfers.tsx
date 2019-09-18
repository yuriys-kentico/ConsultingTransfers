import { Link } from '@reach/router';
import Axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Header, Loader, Segment, Table } from 'semantic-ui-react';

import { getTransfersUrl, getTransferUrl, IRequestItem, IRequestListerResponse } from '../../../connectors/azure/requests';
import { getAuthorizationHeaders } from '../../../utilities/requests';
import { AppContext } from '../../AppContext';
import { RoutedFC } from '../../RoutedFC';
import { AuthenticatedContext } from '../AuthenticatedContext';

export const Transfers: RoutedFC = () => {
  const { terms, azureStorage } = useContext(AppContext);
  const { authProvider } = useContext(AuthenticatedContext);

  const [requests, setRequests] = useState<IRequestItem[]>([]);

  useEffect(() => {
    const { accountName, requestLister } = azureStorage;

    authProvider.getAccessToken().then(({ accessToken }) => {
      const request = {
        accountName
      };

      Axios.post<IRequestListerResponse>(
        requestLister.endpoint,
        request,
        getAuthorizationHeaders(requestLister.key, accessToken)
      ).then(response => setRequests(response.data.requestItems));
    });
  }, [authProvider, azureStorage]);

  const { transfers } = terms.admin;

  return (
    <Segment basic>
      <Header as='h2'>{transfers.header}</Header>
      <Table stackable singleLine basic='very'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{transfers.table.request}</Table.HeaderCell>
            <Table.HeaderCell>{transfers.table.account}</Table.HeaderCell>
            <Table.HeaderCell>{transfers.table.requester}</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {requests.length === 0 ? (
            <Table.Row>
              <Table.Cell>
                <Loader active size='massive' />
              </Table.Cell>
            </Table.Row>
          ) : (
            requests.map((item, index) => (
              <Table.Row key={index}>
                <Table.Cell>{item.system.name}</Table.Cell>
                <Table.Cell>{item.accountName}</Table.Cell>
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
