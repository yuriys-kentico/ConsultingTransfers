import React, { useState, KeyboardEvent } from 'react';
import { Link } from '@reach/router';
import { RoutedFC } from '../types/routing/RoutedFC';
import { Drawer, Divider, List, ListItem, ListItemIcon, ListItemText, makeStyles } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import MailIcon from '@material-ui/icons/Mail';
import { Header } from './Header';
import { AppSettings } from '../types/AppSettings';

export const Home: RoutedFC = props => {
  const [menuIsOpen, setmenuIsOpen] = useState(false);

  const styles = makeStyles({
    list: {
      width: 250
    }
  })();

  const toggleDrawer = (open: boolean) => (event: React.MouseEvent | KeyboardEvent) => {
    if (event.type === 'keydown' && event instanceof KeyboardEvent && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setmenuIsOpen(open);
  };

  return (
    <div>
      <Header iconClickHandler={toggleDrawer(true)} title={AppSettings.terms.header} />
      <Drawer open={menuIsOpen} onClose={toggleDrawer(false)}>
        <div className={styles.list} role='presentation' onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
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
    </div>
  );
};
