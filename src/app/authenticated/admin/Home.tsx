import React, { useContext } from 'react';
import { RoutedFC } from '../../RoutedFC';
import { AppContext } from '../../AppContext';
import { Segment, Header } from 'semantic-ui-react';

export const Home: RoutedFC = () => {
  const appContext = useContext(AppContext);

  return (
    <Segment basic>
      <Header as='h2'>{appContext.terms.home}</Header>
      This is home
  </Segment>
  );
};
