import { Router } from '@reach/router';
import React, { lazy, Suspense } from 'react';
import { boundary, useError } from 'react-boundary';
import { Loader } from 'semantic-ui-react';

import { getTransferUrl } from '../services/azureFunctions/azureFunctions';

const Authenticated = lazy(() =>
  import('./authenticated/Authenticated').then(module => ({ default: module.Authenticated }))
);
const Public = lazy(() => import('./public/Public').then(module => ({ default: module.Public })));
const Details = lazy(() => import('./authenticated/details/Details').then(module => ({ default: module.Details })));

export const App = boundary(() => {
  const [error, info] = useError();

  return error && info ? (
    <div className='error boundary'>
      <h3>Oops! Better fix this:</h3>
      <span>{error.stack}</span>
      <span>{info.componentStack}</span>
    </div>
  ) : (
    <Suspense fallback={<Loader active size='massive' />}>
      <Router>
        <Authenticated path='/*' />
        <Public path={getTransferUrl('*')} />
        <Details path='/details/*' />
      </Router>
    </Suspense>
  );
});
