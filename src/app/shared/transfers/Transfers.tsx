import React, { useState, useEffect, useContext } from 'react';

import { DeliveryClient, ContentItem } from 'kentico-cloud-delivery';
import { Link } from '@reach/router';
import { Header, List, Button, Segment, Placeholder } from 'semantic-ui-react';
import { RoutedFC } from '../../RoutedFC';
import { AppContext } from '../../AppContext';

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
        {items.length === 0 ? (
          <Placeholder>
            <Placeholder.Header>
              <Placeholder.Line />
            </Placeholder.Header>
          </Placeholder>
        ) : (
          items.map((item, index) => (
            <List.Item key={index}>
              <List.Content floated='right'>
                <Button circular icon='edit' as={Link} to={`${item.url.value}`} />
                <Button circular icon='share square' as={Link} to={`../transfer/${item.url.value}`} />
              </List.Content>
              <List.Content header={`${item.system.name}`} className='padding top and bottom' />
            </List.Item>
          ))
        )}
      </List>
    </Segment>
  );
};
