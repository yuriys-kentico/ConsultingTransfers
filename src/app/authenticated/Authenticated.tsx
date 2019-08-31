import { ReactNode, useState, useContext, useEffect } from 'react';
import { UserAgentApplication, Configuration } from 'msal';
import { RoutedFC } from '../RoutedFC';
import React from 'react';
import { AppContext } from '../AppContext';
import { Loader } from 'semantic-ui-react';

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

  useEffect(() => {
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
    }
  }, [accessTokenRequest, userAgentApplication, authenticated]);

  return authenticated ? <div className='full height'>{props.children}</div> : <Loader active size='massive' />;
};
