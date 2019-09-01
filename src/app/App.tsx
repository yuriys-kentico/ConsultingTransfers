import React, { FC, lazy, Suspense } from 'react';
import { Router } from '@reach/router';
import { Loader } from 'semantic-ui-react';

const Public = lazy(() => import('./public/Public').then(module => ({ default: module.Public })));
const Authenticated = lazy(() =>
  import('./authenticated/Authenticated').then(module => ({ default: module.Authenticated }))
);

export const App: FC = () => (
  <Suspense fallback={<Loader active size='massive' />}>
    <Router>
      <Authenticated path='/*' />
      <Public path='/transfer/*' />
    </Router>
  </Suspense>
);