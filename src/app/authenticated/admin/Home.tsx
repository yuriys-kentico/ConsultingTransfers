import React, { useContext } from 'react';
import { Header, Segment } from 'semantic-ui-react';

import { AppContext } from '../../AppContext';
import { RoutedFC } from '../../RoutedFC';

export const Home: RoutedFC = () => {
  const appContext = useContext(AppContext);

  return (
    <Segment basic>
      <Header as='h2'>{appContext.terms.admin.home}</Header>
      This is home
    </Segment>
  );
};
