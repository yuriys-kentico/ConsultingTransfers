import { Router } from '@reach/router';
import { Configuration } from 'msal';
import React, { lazy, Suspense } from 'react';
import { LoginType, MsalAuthProvider } from 'react-aad-msal';
import { boundary, useError } from 'react-boundary';
import { Loader } from 'semantic-ui-react';

import { authentication, terms } from '../appSettings.json';
import { getTransferUrl } from '../services/azureFunctions/azureFunctions';
import { navigateToError } from '../utilities/routing';
import { AuthenticatedContext } from './AuthenticatedContext';
import { AppHeader } from './shared/header/AppHeader';

const Admin = lazy(() => import('./authenticated/admin/Admin').then(module => ({ default: module.Admin })));
const Public = lazy(() => import('./public/Public').then(module => ({ default: module.Public })));
const Details = lazy(() => import('./authenticated/details/Details').then(module => ({ default: module.Details })));
const Error = lazy(() => import('./shared/Error').then(module => ({ default: module.Error })));

export const App = boundary(() => {
  const { header } = terms.shared;

  const [error, info] = useError();

  if (error || info) {
    navigateToError({
      message: terms.genericError,
      stack: `${error && error.stack}${info && info.componentStack}`
    });
  }

  const { config, accessTokenRequest } = authentication;

  config.auth.redirectUri = window.location.origin;

  const authProvider = new MsalAuthProvider(config as Configuration, accessTokenRequest, LoginType.Redirect);

  const authenticatedContext = {
    authProvider
  };

  return (
    <AuthenticatedContext.Provider value={authenticatedContext}>
      <AppHeader title={header.header}>
        <Suspense fallback={<Loader active size='massive' />}>
          <Router>
            <Admin path='/*' />
            <Public path={getTransferUrl('*')} />
            <Details path='/details/*' />
            <Error path='/error' />
          </Router>
        </Suspense>
      </AppHeader>
    </AuthenticatedContext.Provider>
  );
});
