import React, { useContext } from 'react';
import { RoutedFC } from '../RoutedFC';
import { AppHeader } from '../header/AppHeader';
import { AppContext } from '../AppContext';
import { ITransferProps } from '../transfers/Transfer';
import { Container } from 'semantic-ui-react';

export const Public: RoutedFC<ITransferProps> = props => {
  const appContext = useContext(AppContext);

  return (
    <AppHeader title={appContext.terms.header}>
      <Container text>{props.children}</Container>
    </AppHeader>
  );
};
