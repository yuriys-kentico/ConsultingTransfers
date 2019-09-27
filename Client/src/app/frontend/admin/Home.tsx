import React from 'react';
import { Header, Segment } from 'semantic-ui-react';

import { terms } from '../../../appSettings.json';
import { authenticated, AuthenticatedRoutedFC } from '../../../utilities/routing';

export const Home: AuthenticatedRoutedFC = authenticated(() => {
  const { home } = terms.admin;

  return (
    <Segment basic>
      <Header as='h2'>{home.header}</Header>
      This is home
    </Segment>
  );
});
