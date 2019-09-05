import { Link } from '@reach/router';
import { ContentItem, DeliveryClient } from 'kentico-cloud-delivery';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Header, List, Segment, Table } from 'semantic-ui-react';

import { AppContext } from '../AppContext';
import { RoutedFC } from '../RoutedFC';

export const TransferList: RoutedFC = () => {
  const appContext = useContext(AppContext);

  const [items, setItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    const deliveryClient = new DeliveryClient({ ...appContext.kenticoCloud });

    deliveryClient
      .items()
      .type('consulting_request')
      .toObservable()
      .subscribe(response => {
        setItems(response.items);
      });
  }, []);

  return (
    <Segment basic>
      <Header as='h2'>{appContext.terms.transferList}</Header>
      <Table stackable singleLine basic='very' >
        <Table.Body>
          {items.map((item, index) => (
            <Table.Row key={index}>
              <Table.Cell>{item.system.name}</Table.Cell>
              <Table.Cell textAlign='right'><Button circular icon='edit' as={Link} to={`${item.url.value}`} />
                <Button circular icon='share square' as={Link} to={`../transfer/${item.url.value}`} /></Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Segment>
  );
};
