import { Router } from '@reach/router';
import { Configuration } from 'msal';
import React, { lazy } from 'react';
import AzureAD, { LoginType, MsalAuthProvider } from 'react-aad-msal';

import { authentication } from '../../appSettings.json';
import { RoutedFC } from '../RoutedFC';
import { AuthenticatedContext } from './AuthenticatedContext';

const Admin = lazy(() => import('./admin/Admin').then(module => ({ default: module.Admin })));

export const Authenticated: RoutedFC = () => {
  const { config, accessTokenRequest } = authentication;

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
