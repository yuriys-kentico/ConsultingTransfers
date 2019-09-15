import { Router } from '@reach/router';
import React, { lazy, Suspense, useContext } from 'react';
import { Container, Loader } from 'semantic-ui-react';

import { AppContext } from '../AppContext';
import { RoutedFC } from '../RoutedFC';
import { AppHeader } from '../shared/header/AppHeader';
import { ITransferProps } from '../shared/transfer/Transfer';

const Transfer = lazy(() => import('../shared/transfer/Transfer').then(module => ({ default: module.Transfer })));

export const Public: RoutedFC<ITransferProps> = () => {
  const { header } = useContext(AppContext).terms.shared;

  return (
    <AppHeader title={header.header}>
      <Suspense fallback={<Loader active size='massive' />}>
        <Container text>
          <Router>
            <Transfer path=':containerToken' />
          </Router>
        </Container>
      </Suspense>
    </AppHeader>
  );
};
