import React, { FC, ReactNode, useContext, useState } from 'react';
import { Menu, Sidebar } from 'semantic-ui-react';

import { AppContext } from '../../AppContext';
import { AppHeaderContext, IAppHeaderContext, ShowInfoHandler, ShowInfoUntilHandler } from './AppHeaderContext';
import { hideSnackAfter, hideSnackWhen, showSnack, SnackBar } from './SnackBar';

export interface IAppHeaderProps {
  title: string;
  sidebar?: (visible: boolean, onHide: () => void) => ReactNode;
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

  const toggleSidebar = (open: boolean) => {
    setSidebarOpen(open);
  };

  return (
    <AppHeaderContext.Provider value={headerContext}>
      <SnackBar />
      <Sidebar.Pushable>
        {props.sidebar && props.sidebar(sidebarOpen, () => toggleSidebar(false))}
        <Sidebar.Pusher className='full height' dimmed={sidebarOpen}>
          <Sidebar.Pushable>
            <Menu borderless size='massive' inverted>
              {props.sidebar && <Menu.Item icon='bars' onClick={() => toggleSidebar(true)} />}
              <Menu.Item header fitted={props.sidebar && 'horizontally'} content={props.title} />
            </Menu>
            {props.children}
          </Sidebar.Pushable>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </AppHeaderContext.Provider>
  );
};
