import React, { FC } from 'react';
import { Router } from '@reach/router';
import { Home } from './Home';
import { Authenticated } from './Authenticated';
import { Transfer } from './Transfer';
import { CustomerView } from './CustomerView';
import { Transfers } from './Transfers';

export const App: FC = () => (
  <div>
    <Router>
      <Authenticated path='/'>
        <Home path='/'>
          <Transfers path='transfers' />
          <Transfer path='transfers/:urlSlug' />
        </Home>
      </Authenticated>
      <CustomerView path='/transfer'>
        <Transfer path=':urlSlug' />
      </CustomerView>
    </Router>
  </div>
);
