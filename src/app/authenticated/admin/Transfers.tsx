import { Link } from '@reach/router';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Header, Segment, Table } from 'semantic-ui-react';

import { Request } from '../../../connectors/kenticoCloud/contentTypes/Request';
import { KenticoCloud } from '../../../connectors/kenticoCloud/kenticoCloud';
import { AppContext } from '../../AppContext';
import { RoutedFC } from '../../RoutedFC';

export const Transfers: RoutedFC = () => {
  const {
    terms: { admin },
    kenticoCloud
  } = useContext(AppContext);

  const [items, setItems] = useState<Request[]>([]);

  useEffect(() => {
    const deliveryClient = KenticoCloud.deliveryClient({ ...kenticoCloud.deliveryClient });

    deliveryClient
      .items<Request>()
      .type(Request.codename)
      .toObservable()
      .subscribe(response => {
        setItems(response.items);
      });
  }, []);

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
          {items.map((item, index) => (
            <Table.Row key={index}>
              <Table.Cell>{item.system.name}</Table.Cell>
              <Table.Cell>{item.account_name.value}</Table.Cell>
              <Table.Cell>{item.requester.value}</Table.Cell>
              <Table.Cell textAlign='right'>
                <Button circular icon='edit' as={Link} to={`${item.url.value}`} />
                <Button circular icon='share square' as={Link} to={`../transfer/${item.url.value}`} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Segment>
  );
};
