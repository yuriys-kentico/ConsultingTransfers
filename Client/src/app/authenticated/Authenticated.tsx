import { Router } from '@reach/router';
import { Configuration } from 'msal';
import React, { lazy, useContext } from 'react';
import AzureAD, { LoginType, MsalAuthProvider } from 'react-aad-msal';

import { AppContext } from '../AppContext';
import { RoutedFC } from '../RoutedFC';
import { AuthenticatedContext } from './AuthenticatedContext';

const Admin = lazy(() => import('./admin/Admin').then(module => ({ default: module.Admin })));

export const Authenticated: RoutedFC = () => {
  const appContext = useContext(AppContext);

  const { config, accessTokenRequest } = appContext.authentication;

  config.auth.redirectUri = window.location.origin;

  const authProvider = new MsalAuthProvider(config as Configuration, accessTokenRequest, LoginType.Redirect);

  const authenticatedContext = {
    authProvider
  };

  return (
    <AuthenticatedContext.Provider value={authenticatedContext}>
      <AzureAD provider={authProvider} forceLogin={true}>
        <div className='full height'>
          <Router>
            <Admin path='/*' />
          </Router>
        </div>
      </AzureAD>
    </AuthenticatedContext.Provider>
  );
};
