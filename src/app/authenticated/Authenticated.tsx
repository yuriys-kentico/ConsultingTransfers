import { Router } from '@reach/router';
import { Configuration, UserAgentApplication } from 'msal';
import React, { lazy, Suspense, useContext, useEffect, useState } from 'react';
import { Loader } from 'semantic-ui-react';

import { AppContext } from '../AppContext';
import { RoutedFC } from '../RoutedFC';

const Admin = lazy(() => import('./admin/Admin').then(module => ({ default: module.Admin })));

export interface IAuthenticatedProps {
  useAuthentication?: boolean;
}

export const Authenticated: RoutedFC<IAuthenticatedProps> = props => {
  const appContext = useContext(AppContext);

  const [authenticated, setAuthenticated] = useState(appContext.authentication.authenticated);

  const config = appContext.authentication.config as Configuration;

  const userAgentApplication = new UserAgentApplication(config);

  const accessTokenRequest = {
    scopes: ['user.read']
  };

  useEffect(() => {
    if (!authenticated) {
      userAgentApplication
        .acquireTokenSilent(accessTokenRequest)
        .then(() => setAuthenticated(true))
        .catch(() => {
          userAgentApplication
            .loginPopup(accessTokenRequest)
            .then(() => setAuthenticated(true))
            .catch(function(error) {
              console.log(error);
            });
        });
    }
  }, [accessTokenRequest, userAgentApplication, authenticated]);

  return authenticated ? (
    <div className='full height'>
      <Suspense fallback={<Loader active size='massive' />}>
        <Router>
          <Admin path='/*' />
        </Router>
      </Suspense>
    </div>
  ) : (
    <Loader active size='massive' />
  );
};
