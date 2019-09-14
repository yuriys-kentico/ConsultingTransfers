import { Link, LinkGetProps, Router } from '@reach/router';
import React, { lazy, Suspense, useContext } from 'react';
import { Container, Icon, Loader, Menu, Sidebar } from 'semantic-ui-react';

import { AppContext } from '../../AppContext';
import { RoutedFC } from '../../RoutedFC';
import { AppHeader } from '../../shared/header/AppHeader';

const Home = lazy(() => import('./Home').then(module => ({ default: module.Home })));
const Transfers = lazy(() => import('./Transfers').then(module => ({ default: module.Transfers })));
const Transfer = lazy(() => import('../../shared/transfer/Transfer').then(module => ({ default: module.Transfer })));

export const Admin: RoutedFC = () => {
  const {
    terms: { admin, shared }
  } = useContext(AppContext);

  const setActiveWhenCurrent = (linkIsCurrent: (link: LinkGetProps) => boolean) => (link: LinkGetProps) => ({
    className: linkIsCurrent(link) ? 'active item' : 'item'
  });

  const sideBar = (visible: boolean, onHide: () => void) => (
    <Sidebar as={Menu} animation='push' icon='labeled' onHide={onHide} vertical visible={visible} width='very thin'>
      <Menu.Item onClick={onHide} as={Link} to='/' getProps={setActiveWhenCurrent(link => link.isCurrent)}>
        <Icon name='home' />
        {admin.sideBar.home}
      </Menu.Item>
      <Menu.Item
        onClick={onHide}
        as={Link}
        to='transfers'
        getProps={setActiveWhenCurrent(link => link.isPartiallyCurrent)}
      >
        <Icon name='sync' />
        {admin.sideBar.transfers}
      </Menu.Item>
    </Sidebar>
  );

  return (
    <AppHeader title={shared.header.header} sideBar={sideBar}>
      <Suspense fallback={<Loader active size='massive' />}>
        <Container text>
          <Router>
            <Home path='/' />
            <Transfers path='transfers' />
            <Transfer path='transfers/:containerToken' />
          </Router>
        </Container>
      </Suspense>
    </AppHeader>
  );
};
