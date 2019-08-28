import React, { useContext } from 'react';
import { RoutedFC } from '../routing/RoutedFC';
import { Header } from '../navigation/Header';
import { AppContext } from './AppContext';

export interface ITransferProps {
  urlSlug: string;
}

export const CustomerView: RoutedFC<ITransferProps> = props => {
  const appContext = useContext(AppContext);

  return (
    <div>
      <Header title={appContext.terms.header}>{props.children}</Header>
    </div>
  );
};
