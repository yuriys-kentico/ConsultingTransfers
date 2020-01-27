import React, { FC } from 'react';
import AzureAD, { IAzureADProps } from 'react-aad-msal';

import { authProvider } from '../../../services/authProvider';

export const Authenticated: FC<Partial<IAzureADProps>> = props => {
  if (props.forceLogin !== undefined && !props.forceLogin) {
    return <>{props.children}</>;
  }

  return (
    <AzureAD provider={authProvider} {...props}>
      {props.children}
    </AzureAD>
  );
};
