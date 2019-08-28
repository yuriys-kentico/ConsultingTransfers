import React, { useState, KeyboardEvent, useContext } from 'react';
import { Link } from '@reach/router';
import { RoutedFC } from '../routing/RoutedFC';
import { Drawer, Divider, List, ListItem, ListItemIcon, ListItemText, makeStyles } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import MailIcon from '@material-ui/icons/Mail';
import { Header } from '../navigation/Header';
import { AppContext } from './AppContext';

export const Home: RoutedFC = props => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const styles = makeStyles({
    list: {
      width: 250
    }
  })();

  const toggleDrawer = (open: boolean) => (event: React.MouseEvent | KeyboardEvent) => {
    if (event.type === 'keydown' && event instanceof KeyboardEvent && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setMenuIsOpen(open);
  };

  const appContext = useContext(AppContext);

  return (
    <div>
      <Header iconClickHandler={toggleDrawer(true)} title={appContext.terms.header}>
        <Drawer open={menuIsOpen} onClose={toggleDrawer(false)}>
          <div
            className={styles.list}
            role='presentation'
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            <List>
              <ListItem button component={Link} to='/'>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary='Home' />
              </ListItem>
              <ListItem button component={Link} to='transfers'>
                <ListItemIcon>
                  <MailIcon />
                </ListItemIcon>
                <ListItemText primary='Transfers' />
              </ListItem>
            </List>
            <Divider />
          </div>
        </Drawer>
        {props.children}
      </Header>
    </div>
  );
};
