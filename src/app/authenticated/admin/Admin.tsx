import React, { useContext, lazy, Suspense } from 'react';
import { Link, LinkGetProps, Router } from '@reach/router';
import { RoutedFC } from '../../RoutedFC';
import { AppHeader } from '../../shared/header/AppHeader';
import { AppContext } from '../../AppContext';
import { Sidebar, Icon, Menu, Container, Loader } from 'semantic-ui-react';

const Home = lazy(() => import('./Home').then(module => ({ default: module.Home })));
const Transfers = lazy(() =>
  import('../../shared/transfers/Transfers').then(module => ({ default: module.Transfers }))
);
const Transfer = lazy(() => import('../../shared//transfers/Transfer').then(module => ({ default: module.Transfer })));

export const Admin: RoutedFC = () => {
  const appContext = useContext(AppContext);

  const setActiveWhenCurrent = (linkIsCurrent: (link: LinkGetProps) => boolean) => (link: LinkGetProps) => ({
    className: linkIsCurrent(link) ? 'active item' : 'item'
  });

  const sideBar = (visible: boolean, onHide: (event: React.MouseEvent<HTMLElement>) => void) => (
    <Sidebar as={Menu} animation='push' icon='labeled' onHide={onHide} vertical visible={visible} width='thin'>
      <Menu.Item onClick={onHide} as={Link} to='/' getProps={setActiveWhenCurrent(link => link.isCurrent)}>
        <Icon name='home' />
        Home
      </Menu.Item>
      <Menu.Item
        onClick={onHide}
        as={Link}
        to='transfers'
        getProps={setActiveWhenCurrent(link => link.isPartiallyCurrent)}
      >
        <Icon name='sync' />
        Transfers
      </Menu.Item>
    </Sidebar>
  );

  return (
    <AppHeader title={appContext.terms.header} sideBar={sideBar}>
      <Container text>
        <Suspense fallback={<Loader active size='massive' />}>
          <Router>
            <Home path='/' />
            <Transfers path='transfers' />
            <Transfer path='transfers/:urlSlug' authenticated />
          </Router>
        </Suspense>
      </Container>
    </AppHeader>
  );
};
