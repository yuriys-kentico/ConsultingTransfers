import React, { FC, useState, ReactNode, useContext } from 'react';

import { Button, Header, Segment, Sidebar } from 'semantic-ui-react';
import { SnackBar, hideSnackAfter, hideSnackWhen, showSnack } from './SnackBar';
import { AppHeaderContext, IAppHeaderContext } from './AppHeaderContext';
import { AppContext } from '../AppContext';

export type ShowInfoHandler = (text: string, timeout?: number) => void;

export interface IAppHeaderProps {
  title: string;
  sideBar?: (visible: boolean, onHide: (event: React.MouseEvent<HTMLElement>) => void) => ReactNode;
}

export const AppHeader: FC<IAppHeaderProps> = props => {
  const appContext = useContext(AppContext);

  const showInfo: ShowInfoHandler = (text, timeout) => {
    timeout = timeout ? timeout : appContext.experience.snackBarTimeout;

    showSnack(text, 'info', hideSnackAfter(timeout), setHeaderContext);
  };

  const showInfoUntil = (text: string, executor: Promise<unknown>) =>
    showSnack(text, 'info', hideSnackWhen(executor), setHeaderContext);

  const showError: ShowInfoHandler = (text, timeout) => {
    timeout = timeout ? timeout : appContext.experience.snackBarTimeout;

    showSnack(text, 'error', hideSnackAfter(timeout), setHeaderContext);
  };

  const [headerContext, setHeaderContext] = useState<IAppHeaderContext>({
    snacks: [],
    showInfo: showInfo,
    showInfoUntil: showInfoUntil,
    showError: showError
  });

  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const toggleDrawer = (open: boolean) => (_event: React.MouseEvent<HTMLElement>) => {
    setMenuIsOpen(open);
  };

  return (
    <AppHeaderContext.Provider value={headerContext}>
      <SnackBar />
      <Sidebar.Pushable>
        {props.sideBar && props.sideBar(menuIsOpen, toggleDrawer(false))}
        <Sidebar.Pusher className='full height'>
          <Sidebar.Pushable>
            <Sidebar direction='top' visible as={Segment} basic>
              <Header as='h3'>
                {props.sideBar && <Button icon='bars' onClick={toggleDrawer(true)} />}
                {props.title}
              </Header>
            </Sidebar>
            <Sidebar.Pusher as={Segment} basic className='no min height'>
              {props.children}
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </AppHeaderContext.Provider>
  );
};
