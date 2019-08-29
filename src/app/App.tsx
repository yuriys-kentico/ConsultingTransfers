import React, { FC } from 'react';
import { Router } from '@reach/router';
import { Admin } from './Admin';
import { Authenticated } from '../routing/Authenticated';
import { Transfer } from './Transfer';
import { Public } from './Public';
import { Transfers } from './Transfers';
import { Home } from './Home';

export const App: FC = () => (
  <Router>
    <Authenticated path='/'>
      <Admin path='/'>
        <Home path='/' />
        <Transfers path='transfers' />
        <Transfer path='transfers/:urlSlug' />
      </Admin>
    </Authenticated>
    <Public path='/transfer'>
      <Transfer path=':urlSlug' />
    </Public>
  </Router>
);
