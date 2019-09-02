import React, { FC, ReactNode, useContext, useState } from 'react';
import { Menu, Sidebar } from 'semantic-ui-react';
import { AppContext } from '../../AppContext';
import { AppHeaderContext, IAppHeaderContext } from './AppHeaderContext';
import { hideSnackAfter, hideSnackWhen, showSnack, SnackBar, SnackType, UpdateSnackHandler } from './SnackBar';

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
