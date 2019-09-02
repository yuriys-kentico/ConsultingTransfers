import React, { FC, useState, ReactNode, useContext } from 'react';

import { Button, Header, Segment, Sidebar, Menu } from 'semantic-ui-react';
import { SnackBar, hideSnackAfter, hideSnackWhen, showSnack, UpdateSnackHandler, SnackType } from './SnackBar';
import { AppHeaderContext, IAppHeaderContext } from './AppHeaderContext';
import { AppContext } from '../../AppContext';

export type ShowInfoHandler = (text: string, timeout?: number, type?: SnackType) => void;

export type ShowInfoUntilHandler = (message: string, executor: Promise<unknown>, update?: UpdateSnackHandler) => void;

export interface IAppHeaderProps {
  title: string;
  sideBar?: (visible: boolean, onHide: (event: React.MouseEvent<HTMLElement>) => void) => ReactNode;
}

export const AppHeader: FC<IAppHeaderProps> = props => {
  const appContext = useContext(AppContext);

  const showInfo: ShowInfoHandler = (text, timeout, type = 'info') => {
    timeout = timeout ? timeout : appContext.experience.snackTimeout;

    showSnack(setHeaderContext, text, type, hideSnackAfter(timeout));
  };

  const showInfoUntil: ShowInfoUntilHandler = (text, executor, update?) =>
    showSnack(setHeaderContext, text, 'update', hideSnackWhen(executor), update);

  const showError: ShowInfoHandler = (text, timeout) => showInfo(text, timeout, 'error');
  const showSuccess: ShowInfoHandler = (text, timeout) => showInfo(text, timeout, 'success');
  const showWarning: ShowInfoHandler = (text, timeout) => showInfo(text, timeout, 'warning');

  const [headerContext, setHeaderContext] = useState<IAppHeaderContext>({
    snacks: [],
    showInfo,
    showInfoUntil,
    showError,
    showSuccess,
    showWarning
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = (open: boolean) => (event: React.MouseEvent<HTMLElement>) => {
    setSidebarOpen(open);
  };

  return (
    <AppHeaderContext.Provider value={headerContext}>
      <SnackBar />
      <Sidebar.Pushable>
        {props.sideBar && props.sideBar(sidebarOpen, toggleSidebar(false))}
        <Sidebar.Pusher className='full height' dimmed={sidebarOpen}>
          <Sidebar.Pushable>
            {/* <Sidebar direction='top' visible as={Segment} basic>
              <Header as='h2'>
                {props.sideBar && <Button icon='bars' onClick={toggleSidebar(true)} />}
                {props.title.toUpperCase()}
              </Header>
            </Sidebar>
            <Sidebar.Pusher as={Segment} basic>
              {props.children}
            </Sidebar.Pusher> */}
            <Menu borderless size='massive'>
              {props.sideBar && <Menu.Item icon='bars' onClick={toggleSidebar(true)} />}
              <Menu.Item header fitted='horizontally' content={props.title} />
            </Menu>
            {props.children}
          </Sidebar.Pushable>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </AppHeaderContext.Provider>
  );
};
