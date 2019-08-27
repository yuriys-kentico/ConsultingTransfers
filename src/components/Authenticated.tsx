import { ReactNode, useState } from "react";
import { RouteComponentProps } from "@reach/router";
import { UserAgentApplication, Configuration } from "msal";
import { RoutedFC } from "../types/routing/RoutedFC";
import { Typography } from "@material-ui/core";
import React from "react";
import { AppSettings } from "../types/AppSettings";

export interface IAuthenticatedProps {
  useAuthentication?: boolean;
  children: ReactNode;
}

export const Authenticated: RoutedFC<IAuthenticatedProps> = (
  props: RouteComponentProps<IAuthenticatedProps> 
) => {
  const [authenticated, setAuthenticated] = useState(AppSettings.authentication.authenticated);

  const config: Configuration = AppSettings.authentication.config as Configuration;

  // create UserAgentApplication instance
  const userAgentApplication = new UserAgentApplication(config);

  const accessTokenRequest = {
    scopes: ["user.read"]
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
  }

  if (authenticated) {
    return props.children;
  }
  return <Typography>Waiting for login...</Typography> as any;
};
