import { Router } from '@reach/router';
import React, { lazy, Suspense, useContext } from 'react';
import AzureAD from 'react-aad-msal';
import { Container, Loader } from 'semantic-ui-react';

import { RoutedFC } from '../../../utilities/routing';
import { AuthenticatedContext } from '../../AuthenticatedContext';

const Home = lazy(() => import('./Home').then(module => ({ default: module.Home })));
const Transfers = lazy(() => import('./Transfers').then(module => ({ default: module.Transfers })));
const Transfer = lazy(() => import('../../shared/transfer/Transfer').then(module => ({ default: module.Transfer })));
const Error = lazy(() => import('../../shared/Error').then(module => ({ default: module.Error })));

export const Admin: RoutedFC = () => {
  const { authProvider } = useContext(AuthenticatedContext);

  return (
    <AzureAD provider={authProvider} forceLogin>
      <Suspense fallback={<Loader active size='massive' />}>
        <Container text>
          <Router>
            <Home path='/' />
            <Transfers path='transfers' />
            <Transfer path='transfers/:encodedContainerToken' />
            <Error default />
          </Router>
        </Container>
      </Suspense>
    </AzureAD>
  );
};
