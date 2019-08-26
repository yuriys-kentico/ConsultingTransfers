import React, { useState, KeyboardEvent } from "react";
import { Link, Router } from "@reach/router";
import { RoutedFC } from "./routing/RoutedFC";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import HomeIcon from "@material-ui/icons/Home";
import MailIcon from "@material-ui/icons/Mail";
import { Transfers } from "./Transfers";

export const Home: RoutedFC = () => {
  const [menuIsOpen, setmenuIsOpen] = useState(false);

  const styles = makeStyles({
    list: {
      width: 250
    }
  })();

  const toggleDrawer = (open: boolean) => (event: React.MouseEvent | KeyboardEvent) => {
    if (event.type === "keydown" && event instanceof KeyboardEvent && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }

    setmenuIsOpen(open);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon onClick={toggleDrawer(true)} />
          </IconButton>
          <Typography variant="h6">Consulting transfers</Typography>
        </Toolbar>
      </AppBar>
      <Drawer open={menuIsOpen} onClose={toggleDrawer(false)}>
        <div className={styles.list} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <List>
            <ListItem button component={Link} to="/">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button component={Link} to="transfers">
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="Transfers" />
            </ListItem>
          </List>
          <Divider />
        </div>
      </Drawer>
      <Router>
        <Transfers path="transfers"></Transfers>
      </Router>
    </div>
  );
};
