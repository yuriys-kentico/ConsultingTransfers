import { Router } from '@reach/router';
import React, { lazy, Suspense } from 'react';
import { Container, Loader } from 'semantic-ui-react';

import { terms } from '../../appSettings.json';
import { RoutedFC } from '../RoutedFC';
import { AppHeader } from '../shared/header/AppHeader';
import { ITransferProps } from '../shared/transfer/Transfer';

const Transfer = lazy(() => import('../shared/transfer/Transfer').then(module => ({ default: module.Transfer })));

export const Public: RoutedFC<ITransferProps> = () => {
  const { header } = terms.shared;

  return (
    <AppHeader title={header.header}>
      <Suspense fallback={<Loader active size='massive' />}>
        <Container text>
          <Router>
            <Transfer path=':encodedContainerToken' />
          </Router>
        </Container>
      </Suspense>
    </AppHeader>
  );
};
