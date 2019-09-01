import React, { useContext } from 'react';
import { Link, LinkGetProps } from '@reach/router';
import { RoutedFC } from '../../RoutedFC';
import { AppHeader } from '../../header/AppHeader';
import { AppContext } from '../../AppContext';
import { Sidebar, Icon, Menu, Container } from 'semantic-ui-react';

export const Admin: RoutedFC = props => {
  const appContext = useContext(AppContext);

  const setActiveWhenCurrent = (linkIsCurrent: (link: LinkGetProps) => boolean) => (link: LinkGetProps) => ({
    className: linkIsCurrent(link) ? 'active item' : 'item'
  });

  const sideBar = (visible: boolean, onHide: (event: React.MouseEvent<HTMLElement>) => void) => (
    <Sidebar as={Menu} animation='push' icon='labeled' onHide={onHide} vertical visible={visible} width='thin'>
      <Menu.Item onClick={onHide} as={Link} to='/' getProps={setActiveWhenCurrent(link => link.isCurrent)}>
        <Icon name='home' />
        Home
      </Menu.Item>
      <Menu.Item
        onClick={onHide}
        as={Link}
        to='transfers'
        getProps={setActiveWhenCurrent(link => link.isPartiallyCurrent)}
      >
        <Icon name='sync' />
        Transfers
      </Menu.Item>
    </Sidebar>
  );

  return (
    <AppHeader title={appContext.terms.header} sideBar={sideBar}>
      <Container text>{props.children}</Container>
    </AppHeader>
  );
};
