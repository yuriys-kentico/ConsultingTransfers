import { Link, LinkGetProps } from '@reach/router';
import React, { FC, useContext, useState } from 'react';
import AzureAD from 'react-aad-msal';
import { Icon, Menu, Sidebar } from 'semantic-ui-react';

import { experience, terms } from '../../../appSettings.json';
import { promiseAfter } from '../../../utilities/promises';
import { AuthenticatedContext } from '../../AuthenticatedContext';
import { IMessageContext, MessageContext, ShowErrorHandler, ShowInfoHandler, ShowInfoUntilHandler } from './MessageContext';
import { SnackBar } from './SnackBar';
import { hideSnackAfter, hideSnackWhen, showSnack } from './snacks';

export interface IAppHeaderProps {
  title: string;
}

export const AppHeader: FC<IAppHeaderProps> = ({ title, children }) => {
  const { snackTimeout } = experience;
  const { admin } = terms;
  const { authProvider } = useContext(AuthenticatedContext);

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
              to='/'
              getProps={setActiveWhenCurrent(link => link.isCurrent)}
            >
              <Icon name='home' />
              {admin.home.header}
            </Menu.Item>
            <Menu.Item
              onClick={() => setSidebarOpen(false)}
              as={Link}
              to='transfers'
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
              <Menu.Item header fitted='horizontally' content={title} />
            </Menu>
            {children}
          </Sidebar.Pushable>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </MessageContext.Provider>
  );
};
