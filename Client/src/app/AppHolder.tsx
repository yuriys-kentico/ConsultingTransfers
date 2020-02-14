import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { Loader } from 'semantic-ui-react';

import { header } from '../terms.en-us.json';
import { App } from './App';

export const AppHolder = () => {
  return (
    <>
      <Helmet titleTemplate={`%s | ${header.header}`} defaultTitle={header.header}>
        <meta name='description' content={header.description} />
      </Helmet>
      <Suspense fallback={<Loader active size='massive' />}>
        <App />
      </Suspense>
    </>
  );
};
