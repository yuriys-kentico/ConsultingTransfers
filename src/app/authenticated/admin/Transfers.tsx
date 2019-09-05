import { Link } from '@reach/router';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Header, Segment, Table } from 'semantic-ui-react';

import { ConsultingRequest } from '../../../connectors/kenticoCloud/ConsultingRequest';
import { getDeliveryClient } from '../../../connectors/kenticoCloud/kenticoCloud';
import { AppContext } from '../../AppContext';
import { RoutedFC } from '../../RoutedFC';

export const Transfers: RoutedFC = () => {
  const {
    terms: { admin },
    kenticoCloud
  } = useContext(AppContext);

  const [items, setItems] = useState<ConsultingRequest[]>([]);

  useEffect(() => {
    const deliveryClient = getDeliveryClient({ ...kenticoCloud });

    deliveryClient
      .items<ConsultingRequest>()
      .type('consulting_request')
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
          <Table.HeaderCell>{admin.transfers.table.request}</Table.HeaderCell>
          <Table.HeaderCell>{admin.transfers.table.account}</Table.HeaderCell>
          <Table.HeaderCell>{admin.transfers.table.requester}</Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
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
