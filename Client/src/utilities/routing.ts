import { navigate, RouteComponentProps } from '@reach/router';
import Axios from 'axios';
import { FC } from 'react';
import { withAuthentication } from 'react-aad-msal';

import { authProvider } from '../app/authProvider';
import { routes } from '../app/routes';
import { IErrorProps } from '../app/shared/Error';
import { terms } from '../appSettings.json';

Axios.interceptors.response.use(undefined, error => {
  if (error.response && error.response.status === 404) {
    navigateToError({
      message: terms.errors.genericError,
      stack: error.stack
    });
  }
});

export const navigateToError = (errorMessage: IErrorProps) => navigate(routes.error, { state: errorMessage });

interface AuthenticatedProps {
  authenticated?: boolean;
}

export type RoutedFC<P = {}> = FC<RouteComponentProps<P>>;

export type AuthenticatedRoutedFC<P = {}> = FC<RouteComponentProps<P & AuthenticatedProps>>;

export const authenticated = <P extends AuthenticatedProps & {}>(component: FC<RouteComponentProps<P>>) => (props: P) =>
  withAuthentication(component, { provider: authProvider, forceLogin: props.authenticated })(props);

export const getTransferUrl = (containerToken: string) => `${routes.transfer}${encodeURIComponent(containerToken)}`;

export const setTitle = (section?: string) => {
  let title = terms.shared.header.header;

  if (section) {
    title += ` | ${section}`;
  }

  document.title = title;
};
