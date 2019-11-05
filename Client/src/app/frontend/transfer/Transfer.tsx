import React, { lazy, useContext, useEffect } from 'react';
import AzureAD from 'react-aad-msal';
import { Header, Loader, Segment } from 'semantic-ui-react';

import { IAzureFunctionsService } from '../../../services/azureFunctions/AzureFunctionsService';
import { IAzureStorageService } from '../../../services/azureStorage/AzureStorageService';
import { useDependency } from '../../../services/dependencyContainer';
import { transfer as transferTerms } from '../../../terms.en-us.json';
import { useSubscription } from '../../../utilities/observables';
import { RoutedFC, setTitle } from '../../../utilities/routing';
import { authProvider } from '../../authProvider';
import { MessageContext } from '../header/MessageContext';
import { Fields } from './Fields';

const Debug = lazy(() => import('./Debug').then(module => ({ default: module.Debug })));

export interface ITransferProps {
  encodedTransferToken: string;
}

export const Transfer: RoutedFC<ITransferProps> = ({ encodedTransferToken }) => {
  const messageContext = useContext(MessageContext);

  const azureStorageService = useDependency(IAzureStorageService);
  azureStorageService.messageContext = messageContext;

  const azureFunctionsService = useDependency(IAzureFunctionsService);
  azureFunctionsService.messageContext = messageContext;
  const transfer = useSubscription(azureFunctionsService.transfer);

  const transferToken = decodeURIComponent(encodedTransferToken || '');

  useEffect(() => {
    azureFunctionsService.getTransfer(transferToken);
  }, [azureFunctionsService, transferToken, messageContext]);

  useEffect(() => {
    if (transfer) {
      const { containerUrl, containerName, name } = transfer;

      setTitle(name);

      azureStorageService.initialize(containerName, containerUrl);
    }
  }, [transfer, azureStorageService]);

  return (
    <Segment basic>
      {!transfer ? (
        <Loader active size='massive' />
      ) : (
        <>
          <Header as='h2' content={`${transferTerms.header} ${transfer.name}`} />
          <Fields />
          <AzureAD provider={authProvider}>
            <Debug />
          </AzureAD>
        </>
      )}
    </Segment>
  );
};
