import { Router } from '@reach/router';
import React, { lazy, Suspense } from 'react';
import { Container, Loader } from 'semantic-ui-react';

import { RoutedFC } from '../../utilities/routing';
import { ITransferProps } from '../shared/transfer/Transfer';

const Transfer = lazy(() => import('../shared/transfer/Transfer').then(module => ({ default: module.Transfer })));
const Error = lazy(() => import('../shared/Error').then(module => ({ default: module.Error })));

export const Public: RoutedFC<ITransferProps> = () => {
  return (
    <Suspense fallback={<Loader active size='massive' />}>
      <Container text>
        <Router>
          <Transfer path=':encodedContainerToken' />
          <Error default />
        </Router>
      </Container>
    </Suspense>
  );
};
