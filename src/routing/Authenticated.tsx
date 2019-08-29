import { ReactNode, useState, useContext } from 'react';
import { UserAgentApplication, Configuration } from 'msal';
import { RoutedFC } from './RoutedFC';
import React from 'react';
import { AppContext } from '../app/AppContext';
import { Container } from 'semantic-ui-react';

export interface IAuthenticatedProps {
  useAuthentication?: boolean;
  children: ReactNode;
}

export const Authenticated: RoutedFC<IAuthenticatedProps> = props => {
  const appContext = useContext(AppContext);

  const [authenticated, setAuthenticated] = useState(appContext.authentication.authenticated);

  const config = appContext.authentication.config as Configuration;

  // create UserAgentApplication instance
  const userAgentApplication = new UserAgentApplication(config);

  const accessTokenRequest = {
    scopes: ['user.read']
  };

  if (!authenticated) {
    userAgentApplication
      .acquireTokenSilent(accessTokenRequest)
      .then(() => setAuthenticated(true))
      .catch(function(error) {
        userAgentApplication
          .loginPopup(accessTokenRequest)
          .then(() => setAuthenticated(true))
          .catch(function(error) {
            console.log(error);
          });
        console.log(error);
      });
  } else {
    return props.children;
  }

  return <Container content='Waiting for login...' /> as any;
};
