import React, { KeyboardEvent, FC, useState, SyntheticEvent } from 'react';

import { AppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Snackbar from '@material-ui/core/Snackbar';

import { If } from '../utility/If';
import { HeaderContext } from './HeaderContext';

export interface IHeaderProps {
  iconClickHandler?: (event: React.MouseEvent | KeyboardEvent) => void;
  title: string;
}

interface SnackbarMessage {
  text: string;
  key: number;
}

export const Header: FC<IHeaderProps> = props => {
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const [queue, setQueue] = useState<SnackbarMessage[]>([]);

  const [message, setMessage] = useState<SnackbarMessage>({
    text: '',
    key: 0
  });

  const processQueue = () => {
    const next = queue.shift();

    if (next) {
      setMessage(next);
      setSnackbarVisible(true);
    }
  };

  const handleClose = (_event: SyntheticEvent | MouseEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarVisible(false);
  };

  const showMessage = (text: string) => {
    queue.push({
      text: text,
      key: new Date().getTime()
    });

    setQueue(queue);

    if (snackbarVisible) {
      setSnackbarVisible(false);
    }

    processQueue();
  };

  const headerContext = {
    showMessage
  };

  return (
    <HeaderContext.Provider value={headerContext}>
      <Snackbar
        key={message.key}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={snackbarVisible}
        autoHideDuration={6000}
        onClose={handleClose}
        onExited={() => processQueue()}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
        message={<span id='message-id'>{message.text}</span>}
      />
      <AppBar position='static'>
        <Toolbar>
          <If shouldRender={props.iconClickHandler !== undefined}>
            <IconButton edge='start' color='inherit' aria-label='menu'>
              <MenuIcon onClick={event => props.iconClickHandler && props.iconClickHandler(event)} />
            </IconButton>
          </If>
          <Typography variant='h6'>{props.title}</Typography>
        </Toolbar>
      </AppBar>
      {props.children}
    </HeaderContext.Provider>
  );
};
