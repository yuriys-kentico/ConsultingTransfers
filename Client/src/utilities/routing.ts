import { FC } from 'react';
import { withAuthentication } from 'react-aad-msal';

import { RouteComponentProps } from '@reach/router';

import { routes } from '../app/routes';
import { authProvider, authProviderPopup } from '../services/authProvider';

interface AuthenticatedProps {
  authenticated?: boolean;
}

export type RoutedFC<P = {}> = FC<RouteComponentProps<P>>;

export type AuthenticatedRoutedFC<P = {}> = FC<RouteComponentProps<P & AuthenticatedProps>>;

export const authenticated = <P extends AuthenticatedProps & {}>(component: FC<RouteComponentProps<P>>) => (props: P) =>
  withAuthentication(component, { provider: authProvider, forceLogin: props.authenticated })(props);

export const authenticatedPopup = <P extends AuthenticatedProps & {}>(component: FC<RouteComponentProps<P>>) => (
  props: P
) => withAuthentication(component, { provider: authProviderPopup, forceLogin: props.authenticated })(props);

export const getTransferUrl = (transferToken: string) => `${routes.transfer}${encodeURIComponent(transferToken)}`;
