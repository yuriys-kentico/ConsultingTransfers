import React, { FC, useState, ReactNode } from 'react';

import { If } from '../utility/If';
import { Button, Header, Segment, Sidebar } from 'semantic-ui-react';
import { SnackBar } from './SnackBar';
import { HeaderContext, IHeaderContext } from './HeaderContext';


export interface IHeaderProps {
  title: string;
  sideBar?: (visible: boolean, onHide: (event: React.MouseEvent<HTMLElement>) => void) => ReactNode;
}

export const HeaderBar: FC<IHeaderProps> = props => {
  const showMessage = (text: string) => {
    const newSnack = {
      text: text
    };

    setHeaderContext(state => ({
      ...state,
      snacks: [...state.snacks, newSnack]
    }));
  };

  const [headerContext, setHeaderContext] = useState<IHeaderContext>({
    snacks: [],
    showMessage
  });

  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const toggleDrawer = (open: boolean) => (event: React.MouseEvent<HTMLElement>) => {
    setMenuIsOpen(open);
  };

  return (
    <HeaderContext.Provider value={headerContext}>
      <SnackBar />
      <Sidebar.Pushable>
        {props.sideBar !== undefined ? props.sideBar(menuIsOpen, toggleDrawer(false)) : null}
        <Sidebar.Pusher className='height100'>
          <Sidebar.Pushable>
            <Sidebar direction='top' visible as={Segment} basic>
              <Header as='h3'>
                <If shouldRender={props.sideBar !== undefined}>
                  <Button icon='bars' onClick={toggleDrawer(true)} />
                </If>
                {props.title}
              </Header>
            </Sidebar>
            <Sidebar.Pusher as={Segment} basic className='noMinHeight'>
              {props.children}
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </HeaderContext.Provider>
  );
};
