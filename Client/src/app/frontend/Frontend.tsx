import React, { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { Container, Icon, Loader, Menu, Sidebar } from 'semantic-ui-react';

import { Link, LinkGetProps, Location, Router } from '@reach/router';

import { admin, errors, header } from '../../terms.en-us.json';
import { deleteFrom } from '../../utilities/arrays';
import { wait } from '../../utilities/promises';
import { RoutedFC } from '../../utilities/routing';
import { routes, shouldAuthenticateRoute } from '../routes';
import { Authenticated } from './admin/Authenticated';
import {
    IMessageContext,
    MessageContext,
    ShowErrorHandler,
    ShowInfoHandler,
    ShowInfoUntilHandler
} from './header/MessageContext';
import { Snack } from './header/Snack';
import { ISnack, showSnack } from './header/snacks';

const Home = lazy(() => import('./admin/Home').then(module => ({ default: module.Home })));
const Transfers = lazy(() => import('./admin/Transfers').then(module => ({ default: module.Transfers })));
const NewTransfer = lazy(() => import('./admin/NewTransfer').then(module => ({ default: module.NewTransfer })));
const Transfer = lazy(() => import('./transfer/Transfer').then(module => ({ default: module.Transfer })));
const Error = lazy(() => import('../shared/Error').then(module => ({ default: module.Error })));

const setActiveWhenCurrent = (linkIsCurrent: (link: LinkGetProps) => boolean) => (link: LinkGetProps) => ({
  className: linkIsCurrent(link) ? 'active item' : 'item'
});

export const Frontend: RoutedFC = () => {
  const showSuccess: ShowInfoHandler = (text, timeout) => showInfo(text, timeout, 'success');

  const showInfo: ShowInfoHandler = useCallback((text, timeout, type = 'info') => {
    showSnack(
      text,
      type,
      snack => setSnacks(snacks => [...snacks, snack]),
      wait(timeout || 0),
      snack => setSnacks(snacks => deleteFrom(snack, snacks))
    );
  }, []);

  const showInfoUntil: ShowInfoUntilHandler = useCallback((text, isComplete, abort, update?) => {
    showSnack(
      text,
      'update',
      snack => setSnacks(snacks => [...snacks, snack]),
      isComplete,
      snack => setSnacks(snacks => deleteFrom(snack, snacks)),
      abort,
      update
    );
  }, []);

  const showWarning: ShowInfoHandler = useCallback(
    (text, timeout) => {
      console.warn(text);

      showInfo(text, timeout, 'warning');
    },
    [showInfo]
  );

  const showError: ShowErrorHandler = useCallback(
    (error, timeout) => {
      console.error(error);

      const text = (error.body && error.body.message) || error.message;

      showInfo(text, timeout, 'error');
    },
    [showInfo]
  );

  const [snacks, setSnacks] = useState<ISnack[]>([]);

  const headerContext = useRef<IMessageContext>({
    showSuccess,
    showInfo,
    showInfoUntil,
    showWarning,
    showError
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <MessageContext.Provider value={headerContext.current}>
      <div className='snack bar'>
        {snacks.map(snack => (
          <Snack {...snack} />
        ))}
      </div>
      <Location>
        {({ location }) => (
          <Authenticated forceLogin={shouldAuthenticateRoute(location.pathname)}>
            <Sidebar.Pushable>
              <Authenticated>
                <Sidebar
                  as={Menu}
                  animation='push'
                  icon='labeled'
                  onHide={() => setSidebarOpen(false)}
                  vertical
                  visible={sidebarOpen}
                  width='very thin'
                >
                  <Menu.Item
                    onClick={() => setSidebarOpen(false)}
                    as={Link}
                    to={routes.home}
                    getProps={setActiveWhenCurrent(link => link.isCurrent)}
                  >
                    <Icon name='home' />
                    {admin.home.header}
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => setSidebarOpen(false)}
                    as={Link}
                    to={routes.transfers}
                    getProps={setActiveWhenCurrent(link => link.isPartiallyCurrent)}
                  >
                    <Icon name='sync' />
                    {admin.transfers.header}
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => setSidebarOpen(false)}
                    as={Link}
                    to={routes.newTransfer}
                    getProps={setActiveWhenCurrent(link => link.isPartiallyCurrent)}
                  >
                    <Icon name='send' />
                    {admin.newTransfer.header}
                  </Menu.Item>
                </Sidebar>
              </Authenticated>
              <Sidebar.Pusher className='full height app' dimmed={sidebarOpen}>
                <Sidebar.Pushable>
                  <Menu borderless size='massive' inverted>
                    <Authenticated>
                      <Menu.Item icon='bars' onClick={() => setSidebarOpen(true)} />
                    </Authenticated>
                    <Menu.Item header fitted='horizontally' content={header.header} />
                  </Menu>
                  <Container>
                    <Suspense fallback={<Loader active size='massive' />}>
                      <Router>
                        <Home path={routes.home} authenticated />
                        <Transfers path={routes.transfers} authenticated />
                        <NewTransfer path={routes.newTransfer} authenticated />
                        <Transfer path={`${routes.transfer}:encodedTransferToken`} />
                        <Error path={routes.error} default message={errors.notFound} />
                      </Router>
                    </Suspense>
                  </Container>
                </Sidebar.Pushable>
              </Sidebar.Pusher>
            </Sidebar.Pushable>
          </Authenticated>
        )}
      </Location>
    </MessageContext.Provider>
  );
};
