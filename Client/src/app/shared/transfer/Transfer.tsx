import React, { lazy, useContext, useEffect } from 'react';
import AzureAD from 'react-aad-msal';
import { Header, Loader, Segment } from 'semantic-ui-react';

import { terms } from '../../../appSettings.json';
import { IAzureFunctionsService } from '../../../services/azureFunctions/AzureFunctionsService';
import { IAzureStorageService } from '../../../services/azureStorage/AzureStorageService';
import { useDependency } from '../../../services/dependencyContainer';
import { useSubscription } from '../../../utilities/observables';
import { RoutedFC } from '../../../utilities/routing';
import { AuthenticatedContext } from '../../AuthenticatedContext';
import { MessageContext } from '../header/MessageContext';
import { Fields } from './Fields';

const Debug = lazy(() => import('../../authenticated/admin/Debug').then(module => ({ default: module.Debug })));

export interface ITransferProps {
  encodedContainerToken: string;
}

export const Transfer: RoutedFC<ITransferProps> = ({ encodedContainerToken }) => {
  const { authProvider } = useContext(AuthenticatedContext);
  const messageContext = useContext(MessageContext);

  const azureStorageService = useDependency(IAzureStorageService);
  azureStorageService.messageHandlers = messageContext;

  const azureFunctionsService = useDependency(IAzureFunctionsService);
  const transferDetails = useSubscription(azureFunctionsService.transferDetails);

  const containerToken = decodeURIComponent(encodedContainerToken || '');

  useEffect(() => {
    azureFunctionsService.getTransferDetails(authProvider, containerToken, messageContext);
  }, [azureFunctionsService, authProvider, containerToken, messageContext]);

  useEffect(() => {
    if (transferDetails) {
      const { containerUrl, containerName } = transferDetails;

      azureStorageService.initialize(containerName, containerUrl);
    }
  }, [transferDetails, azureStorageService]);

  return (
    <Segment basic>
      {!transferDetails ? (
        <Loader active size='massive' />
      ) : (
        <>
          <Header as='h2' content={`${terms.shared.transfer.header} ${transferDetails.transfer.system.name}`} />
          <Fields />
          <AzureAD provider={authProvider}>
            <Debug />
          </AzureAD>
        </>
      )}
    </Segment>
  );
};
