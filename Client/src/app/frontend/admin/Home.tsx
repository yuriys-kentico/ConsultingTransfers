import React from 'react';
import { Header, List, Segment } from 'semantic-ui-react';

import { admin } from '../../../terms.en-us.json';
import { authenticated, AuthenticatedRoutedFC } from '../../../utilities/routing';

export const Home: AuthenticatedRoutedFC = authenticated(() => {
  const { home } = admin;

  return (
    <Segment basic>
      <Header as='h2'>{home.header}</Header>
      <Header as='h3'>
        <img alt='logo' src='/logo192.png' />
        <Header.Content>
          caddy
          <Header.Subheader>[ kad-ee ]</Header.Subheader>
        </Header.Content>
      </Header>
      <i>noun, plural</i> <b>cad·dies</b>.
      <List>
        <List.Item>
          a container, rack, or other device for holding, organizing, or storing items: a pencil caddy; a bedspread
          caddy.
        </List.Item>
      </List>
    </Segment>
  );
});
