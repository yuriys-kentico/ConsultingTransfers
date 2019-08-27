import React from 'react';
import { RoutedFC } from '../types/routing/RoutedFC';
import { Header } from './Header';
import { AppSettings } from '../types/AppSettings';

export interface ITransferProps {
  urlSlug: string;
}

export const CustomerView: RoutedFC<ITransferProps> = props => {
  return (
    <div>
      <Header title={AppSettings.terms.header} />
      {props.children}
    </div>
  );
};
