import { detect } from 'detect-browser';
import React, { lazy } from 'react';
import { boundary, useError } from 'react-boundary';

import { Router } from '@reach/router';

import { errors } from '../terms.en-us.json';
import { format } from '../utilities/strings';
import { routes } from './routes';

const Frontend = lazy(() => import('./frontend/Frontend').then(module => ({ default: module.Frontend })));
const Details = lazy(() => import('./details/Details').then(module => ({ default: module.Details })));
const Error = lazy(() => import('./shared/Error').then(module => ({ default: module.Error })));

export const App = boundary(() => {
  const [error, info] = useError();

  if (error || info) {
    return <Error stack={`${error && error.stack}${info && info.componentStack}`} />;
  }

  const browser = detect();

  switch (browser && browser.name) {
    case 'chrome':
    case 'firefox':
    case 'edge-chromium':
      return (
        <Router>
          <Frontend path='*' />
          <Details path={`${routes.details}:region`} authenticated />
          <Error path={routes.error} default message={errors.notFound} />
        </Router>
      );
    default:
      return (
        <Error
          message={format(errors.notSupported.header, browser?.name.toString() || errors.notSupported.unknown)}
          stack={errors.notSupported.message}
        />
      );
  }
});
