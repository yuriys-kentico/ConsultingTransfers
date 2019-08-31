import React, { useState, useEffect, useContext } from 'react';

import { RoutedFC } from '../RoutedFC';
import { AppContext } from '../AppContext';
import { DeliveryClient, ContentItem } from 'kentico-cloud-delivery';
import { Link } from '@reach/router';
import { Header, List, Button, Segment } from 'semantic-ui-react';

export const Transfers: RoutedFC = () => {
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
  }, [appContext.kenticoCloud]);

  return (
    <Segment basic>
      <Header as='h2'> Active transfers:</Header>
      <List divided verticalAlign='middle'>
        {items.map((item, index) => (
          <List.Item key={index}>
            <List.Content floated='right'>
              <Button
                icon='share square'
                as={Link}
                to={`../transfer/${item.url.value}`}
              />
              <Button icon='edit' as={Link} to={`${item.url.value}`} />
            </List.Content>
            <List.Content header={`${item.system.name}`} className='padding top and bottom' />
          </List.Item>
        ))}
      </List>
    </Segment>
  );
};
