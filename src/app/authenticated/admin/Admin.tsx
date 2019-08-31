import React, { useContext } from 'react';
import { Link } from '@reach/router';
import { RoutedFC } from '../../RoutedFC';
import { AppHeader } from '../../header/AppHeader';
import { AppContext } from '../../AppContext';
import { Sidebar, Icon, Menu } from 'semantic-ui-react';

export const Admin: RoutedFC = props => {
  const appContext = useContext(AppContext);

  const sideBar = (visible: boolean, onHide: (event: React.MouseEvent<HTMLElement>) => void) => (
    <Sidebar as={Menu} animation='overlay' icon='labeled' onHide={onHide} vertical visible={visible} width='thin'>
      <Menu.Item onClick={onHide} as={Link} to='/'>
        <Icon name='home' />
        Home
      </Menu.Item>
      <Menu.Item onClick={onHide} as={Link} to='transfers'>
        <Icon name='sync' />
        Transfers
      </Menu.Item>
    </Sidebar>
  );

  return (
    <AppHeader title={appContext.terms.header} sideBar={sideBar}>
      {props.children}
    </AppHeader>
  );
};
