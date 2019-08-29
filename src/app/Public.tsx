import React, { useContext } from 'react';
import { RoutedFC } from '../routing/RoutedFC';
import { HeaderBar } from '../header/HeaderBar';
import { AppContext } from './AppContext';
import { ITransferProps } from './Transfer';

export const Public: RoutedFC<ITransferProps> = props => {
  const appContext = useContext(AppContext);

  return <HeaderBar title={appContext.terms.header}>{props.children}</HeaderBar>;
};
