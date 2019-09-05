import { Router } from '@reach/router';
import React, { lazy, Suspense, useContext } from 'react';
import { Container, Loader } from 'semantic-ui-react';

import { AppContext } from '../AppContext';
import { RoutedFC } from '../RoutedFC';
import { AppHeader } from '../shared/header/AppHeader';
import { ITransferProps } from '../shared/transfers/Transfer';

const Transfer = lazy(() => import('../shared/transfers/Transfer').then(module => ({ default: module.Transfer })));

export const Public: RoutedFC<ITransferProps> = () => {
  const appContext = useContext(AppContext);

  return (
    <AppHeader title={appContext.terms.shared.header.header}>
      <Container text>
        <Suspense fallback={<Loader active size='massive' />}>
          <Router>
            <Transfer path=':urlSlug' />
          </Router>
        </Suspense>
      </Container>
    </AppHeader>
  );
};
