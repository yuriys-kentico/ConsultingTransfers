import React, { FC, lazy, Suspense } from 'react';
import { Router } from '@reach/router';
import { Loader } from 'semantic-ui-react';

const Home = lazy(() => import('./authenticated/admin/Home').then(module => ({ default: module.Home })));
const Transfers = lazy(() => import('./transfers/Transfers').then(module => ({ default: module.Transfers })));
const Transfer = lazy(() => import('./transfers/Transfer').then(module => ({ default: module.Transfer })));
const Public = lazy(() => import('./public/Public').then(module => ({ default: module.Public })));
const Admin = lazy(() => import('./authenticated/admin/Admin').then(module => ({ default: module.Admin })));
const Authenticated = lazy(() =>
  import('./authenticated/Authenticated').then(module => ({ default: module.Authenticated }))
);

export const App: FC = () => (
  <Suspense fallback={<Loader active size='massive' />}>
    <Router>
      <Authenticated path='/'>
        <Admin path='/'>
          <Home path='/' />
          <Transfers path='transfers' />
          <Transfer path='transfers/:urlSlug' authenticated />
        </Admin>
      </Authenticated>
      <Public path='/transfer'>
        <Transfer path=':urlSlug' />
      </Public>
    </Router>
  </Suspense>
);
