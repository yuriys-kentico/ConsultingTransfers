import React, { lazy, Suspense } from 'react';
import { boundary, useError } from 'react-boundary';
import { Helmet } from 'react-helmet';
import { Loader } from 'semantic-ui-react';

import { Router } from '@reach/router';

import { errors, header } from '../terms.en-us.json';
import { routes } from './routes';

const Frontend = lazy(() => import('./frontend/Frontend').then(module => ({ default: module.Frontend })));
const Details = lazy(() => import('./details/Details').then(module => ({ default: module.Details })));
const Error = lazy(() => import('./shared/Error').then(module => ({ default: module.Error })));

export const App = boundary(() => {
  const [error, info] = useError();

  if (error || info) {
    return <Error stack={`${error && error.stack}${info && info.componentStack}`} />;
  }

  return (
    <>
      <Helmet titleTemplate={`%s | ${header.header}`} defaultTitle={header.header}>
        <meta name='description' content={header.description} />
      </Helmet>
      <Suspense fallback={<Loader active size='massive' />}>
        <Router>
          <Frontend path='*' />
          <Details path={routes.details} authenticated />
          <Error path={routes.error} default message={errors.notFound} />
        </Router>
      </Suspense>
    </>
  );
});
