import React, { KeyboardEvent, FC } from 'react';

import { AppBar, Toolbar, IconButton, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

import { If } from './utility/If';

export interface IHeaderProps {
  iconClickHandler?: (event: React.MouseEvent | KeyboardEvent) => void;
  title: string;
}

export const Header: FC<IHeaderProps> = props => (
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
);
