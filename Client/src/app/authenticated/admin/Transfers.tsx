import { Link } from '@reach/router';
import Axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Header, Segment, Table } from 'semantic-ui-react';

import { IRequestItem } from '../../../connectors/azureFunctions/IRequestItem';
import { IRequestListerResponse } from '../../../connectors/azureFunctions/IRequestListerResponse';
import { AppContext } from '../../AppContext';
import { RoutedFC } from '../../RoutedFC';
import { AuthenticatedContext } from '../AuthenticatedContext';

export const Transfers: RoutedFC = () => {
  const {
    terms: { admin },
    azureStorage: { accountName, requestListerEndpoint }
  } = useContext(AppContext);
  const { authProvider } = useContext(AuthenticatedContext);

  const [requests, setRequests] = useState<IRequestItem[]>([]);

  useEffect(() => {
    authProvider.getAccessToken().then(response => {
      const request = {
        accountName,
        accessToken: response.accessToken
      };

      Axios.post<IRequestListerResponse>(requestListerEndpoint, request).then(response =>
        setRequests(response.data.requestItems)
      );
    });
  }, []);

  const getRequestUrl = (item: IRequestItem) => {
    return `${item.system.codename}|test`;
  };

  return (
    <Segment basic>
      <Header as='h2'>{admin.transfers.header}</Header>
      <Table stackable singleLine basic='very'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{admin.transfers.table.request}</Table.HeaderCell>
            <Table.HeaderCell>{admin.transfers.table.account}</Table.HeaderCell>
            <Table.HeaderCell>{admin.transfers.table.requester}</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {requests.map((item, index) => (
            <Table.Row key={index}>
              <Table.Cell>{item.system.name}</Table.Cell>
              <Table.Cell>{item.accountName}</Table.Cell>
              <Table.Cell>{item.requester}</Table.Cell>
              <Table.Cell textAlign='right'>
                <Button circular icon='edit' as={Link} to={getRequestUrl(item)} />
                <Button circular icon='share square' as={Link} to={`../transfer/${getRequestUrl(item)}`} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Segment>
  );
};
