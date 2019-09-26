import { navigate, RouteComponentProps } from '@reach/router';
import Axios from 'axios';
import { FC } from 'react';

import { IErrorMessage } from '../app/shared/Error';
import { terms } from '../appSettings.json';

Axios.interceptors.response.use(undefined, error => {
  if (error.response && error.response.status === 404) {
    navigateToError({
      message: terms.genericError,
      stack: error.stack
    });
  }
});

export const navigateToError = (errorMessage: IErrorMessage) => navigate('/error', { state: errorMessage });

export type RoutedFC<P = {}> = FC<RouteComponentProps<P>>;
