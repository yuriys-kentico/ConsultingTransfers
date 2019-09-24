import React from 'react';
import { Header, Segment } from 'semantic-ui-react';

import { terms } from '../../../appSettings.json';
import { RoutedFC } from '../../RoutedFC';

export const Home: RoutedFC = () => {
  const { home } = terms.admin;

  return (
    <Segment basic>
      <Header as='h2'>{home.header}</Header>
      This is home
    </Segment>
  );
};
