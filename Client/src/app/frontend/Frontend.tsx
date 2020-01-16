import React, { lazy, Suspense, useRef, useState } from 'react';
import AzureAD from 'react-aad-msal';
import { Container, Icon, Loader, Menu, Sidebar } from 'semantic-ui-react';

import { Link, LinkGetProps, Router } from '@reach/router';

import { experience } from '../../appSettings.json';
import { authProvider } from '../../services/authProvider';
import { admin, errors, header } from '../../terms.en-us.json';
import { deleteFrom } from '../../utilities/arrays';
import { wait } from '../../utilities/promises';
import { RoutedFC } from '../../utilities/routing';
import { routes } from '../routes';
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

export const Frontend: RoutedFC = () => {
  const { snackTimeout } = experience;

  const showSuccess: ShowInfoHandler = (text, timeout) => showInfo(text, timeout, 'success');

  const showInfo: ShowInfoHandler = (text, timeout, type = 'info') => {
    showSnack(
      text,
      type,
      snack => setSnacks(snacks => [...snacks, snack]),
      wait(timeout || snackTimeout),
      snack => setSnacks(snacks => deleteFrom(snack, snacks))
    );
  };

  const showInfoUntil: ShowInfoUntilHandler = (text, isComplete, update?) => {
    showSnack(
      text,
      'update',
      snack => setSnacks(snacks => [...snacks, snack]),
      isComplete.then(() => wait(snackTimeout)),
      snack => setSnacks(snacks => deleteFrom(snack, snacks)),
      update
    );
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

  const [snacks, setSnacks] = useState<ISnack[]>([]);

  const headerContext = useRef<IMessageContext>({
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
    <MessageContext.Provider value={headerContext.current}>
      <div className='snack bar'>
        {snacks.map(snack => (
          <Snack {...snack} />
        ))}
      </div>
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
        </AzureAD>
        <Sidebar.Pusher className='full height app' dimmed={sidebarOpen}>
          <Sidebar.Pushable>
            <Menu borderless size='massive' inverted>
              <AzureAD provider={authProvider}>
                <Menu.Item icon='bars' onClick={() => setSidebarOpen(true)} />
              </AzureAD>
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
    </MessageContext.Provider>
  );
};
