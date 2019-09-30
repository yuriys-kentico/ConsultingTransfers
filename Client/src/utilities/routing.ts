import { navigate, RouteComponentProps } from '@reach/router';
import Axios from 'axios';
import { FC } from 'react';
import { withAuthentication } from 'react-aad-msal';

import { authProvider } from '../app/authProvider';
import { routes } from '../app/routes';
import { errors, header } from '../terms.en-us.json';

Axios.interceptors.response.use(undefined, error => {
  if (error.response && error.response.status === 404) {
    navigate(routes.error, {
      state: {
        message: errors.genericError,
        stack: error.stack
      }
    });
  }
});

interface AuthenticatedProps {
  authenticated?: boolean;
}

export type RoutedFC<P = {}> = FC<RouteComponentProps<P>>;

export type AuthenticatedRoutedFC<P = {}> = FC<RouteComponentProps<P & AuthenticatedProps>>;

export const authenticated = <P extends AuthenticatedProps & {}>(component: FC<RouteComponentProps<P>>) => (props: P) =>
  withAuthentication(component, { provider: authProvider, forceLogin: props.authenticated })(props);

export const getTransferUrl = (containerToken: string) => `${routes.transfer}${encodeURIComponent(containerToken)}`;

export const setTitle = (section?: string) => {
  let title = header.header;

  if (section) {
    title += ` | ${section}`;
  }

  document.title = title;
};
