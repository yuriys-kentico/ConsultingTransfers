import React, { FC } from 'react';
import { Router } from '@reach/router';
import { Admin } from './authenticated/admin/Admin';
import { Authenticated } from './authenticated/Authenticated';
import { Transfer } from './transfers/Transfer';
import { Public } from './public/Public';
import { Transfers } from './transfers/Transfers';
import { Home } from './authenticated/admin/Home';

export const App: FC = () => (
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
);
