import { Link, LinkGetProps, Router } from '@reach/router';
import React, { lazy, Suspense, useState } from 'react';
import AzureAD from 'react-aad-msal';
import { Container, Icon, Loader, Menu, Sidebar } from 'semantic-ui-react';

import { experience, terms } from '../../appSettings.json';
import { promiseAfter } from '../../utilities/promises';
import { RoutedFC } from '../../utilities/routing';
import { authProvider } from '../authProvider';
import { routes } from '../routes';
import {
    IMessageContext,
    MessageContext,
    ShowErrorHandler,
    ShowInfoHandler,
    ShowInfoUntilHandler,
} from './header/MessageContext';
import { SnackBar } from './header/SnackBar';
import { hideSnackAfter, hideSnackWhen, showSnack } from './header/snacks';

const Home = lazy(() => import('./admin/Home').then(module => ({ default: module.Home })));
const Transfers = lazy(() => import('./admin/Transfers').then(module => ({ default: module.Transfers })));
const Transfer = lazy(() => import('./transfer/Transfer').then(module => ({ default: module.Transfer })));
const Error = lazy(() => import('../shared/Error').then(module => ({ default: module.Error })));

export const Frontend: RoutedFC = () => {
  const { snackTimeout } = experience;
  const { admin, shared, errors } = terms;

  const showSuccess: ShowInfoHandler = (text, timeout) => showInfo(text, timeout, 'success');

  const showInfo: ShowInfoHandler = (text, timeout, type = 'info') => {
    timeout = timeout ? timeout : snackTimeout;

    showSnack(setHeaderContext, text, type, hideSnackAfter(timeout));
  };

  const showInfoUntil: ShowInfoUntilHandler = (text, executor, update?) => {
    showSnack(setHeaderContext, text, 'update', hideSnackWhen(executor.then(promiseAfter(snackTimeout))), update);
  };

  const showWarning: ShowErrorHandler = (error, timeout) => {
    console.warn(error);

    const text = (error.body && error.body.message) || error.message;

    showInfo(text, timeout, 'warning');
  };

  const showError: ShowErrorHandler = (error, timeout) => {
    console.error(error);

    const text = (error.body && error.body.message) || error.message;

    showInfo(text, timeout, 'error');
  };

  const [headerContext, setHeaderContext] = useState<IMessageContext>({
    snacks: [],
    showSuccess,
    showInfo,
    showInfoUntil,
    showWarning,
    showError
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setActiveWhenCurrent = (linkIsCurrent: (link: LinkGetProps) => boolean) => (link: LinkGetProps) => ({
    className: linkIsCurrent(link) ? 'active item' : 'item'
  });

  return (
    <MessageContext.Provider value={headerContext}>
      <SnackBar />
      <Sidebar.Pushable>
        <AzureAD provider={authProvider}>
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
          </Sidebar>
        </AzureAD>
        <Sidebar.Pusher className='full height app' dimmed={sidebarOpen}>
          <Sidebar.Pushable>
            <Menu borderless size='massive' inverted>
              <AzureAD provider={authProvider}>
                <Menu.Item icon='bars' onClick={() => setSidebarOpen(true)} />
              </AzureAD>
              <Menu.Item header fitted='horizontally' content={shared.header.header} />
            </Menu>
            <Container>
              <Suspense fallback={<Loader active size='massive' />}>
                <Router>
                  <Home path={routes.home} authenticated />
                  <Transfers path={routes.transfers} authenticated />
                  <Transfer path={`${routes.transfer}:encodedContainerToken`} />
                  <Error path={routes.error} default message={errors.notFound} />
                </Router>
              </Suspense>
            </Container>
          </Sidebar.Pushable>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </MessageContext.Provider>
  );
};
