import { Router } from '@reach/router';
import React, { lazy, useContext } from 'react';
import { Container } from 'semantic-ui-react';

import { AppContext } from '../AppContext';
import { RoutedFC } from '../RoutedFC';
import { AppHeader } from '../shared/header/AppHeader';
import { ITransferProps } from '../shared/transfer/Transfer';

const Transfer = lazy(() => import('../shared/transfer/Transfer').then(module => ({ default: module.Transfer })));

export const Public: RoutedFC<ITransferProps> = () => {
  const appContext = useContext(AppContext);

  return (
    <AppHeader title={appContext.terms.shared.header.header}>
      <Container text>
        <Router>
          <Transfer path=':urlSlug' />
        </Router>
      </Container>
    </AppHeader>
  );
};
