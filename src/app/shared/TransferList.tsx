import { Link } from '@reach/router';
import { ContentItem, DeliveryClient } from 'kentico-cloud-delivery';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Header, List, Segment } from 'semantic-ui-react';

import { AppContext } from '../AppContext';
import { RoutedFC } from '../RoutedFC';
import { Loading } from './transfers/Loading';

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
      <List divided verticalAlign='middle'>
        {items.length === 0 ? (
          <Loading />
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
