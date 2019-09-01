import React, { useContext, lazy, Suspense } from 'react';
import { RoutedFC } from '../RoutedFC';
import { AppHeader } from '../shared/header/AppHeader';
import { AppContext } from '../AppContext';
import { Container, Loader } from 'semantic-ui-react';
import { ITransferProps } from '../shared/transfers/Transfer';
import { Router } from '@reach/router';

const Transfer = lazy(() => import('../shared/transfers/Transfer').then(module => ({ default: module.Transfer })));

export const Public: RoutedFC<ITransferProps> = props => {
  const appContext = useContext(AppContext);

  return (
    <AppHeader title={appContext.terms.header}>
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
