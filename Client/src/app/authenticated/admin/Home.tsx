import React, { useContext } from 'react';
import { Header, Segment } from 'semantic-ui-react';

import { AppContext } from '../../AppContext';
import { RoutedFC } from '../../RoutedFC';

export const Home: RoutedFC = () => {
  const { home } = useContext(AppContext).terms.admin;

  return (
    <Segment basic>
      <Header as='h2'>{home.header}</Header>
      This is home
    </Segment>
  );
};
