import React, { lazy, useContext, useEffect, useState } from 'react';
import AzureAD from 'react-aad-msal';
import Helmet from 'react-helmet';
import { Header, Loader, Segment } from 'semantic-ui-react';

import { useDependency } from '../../../services/dependencyContainer';
import { ITransferFilesService } from '../../../services/TransferFilesService';
import { ITransfersService } from '../../../services/TransfersService';
import { transfer as transferTerms } from '../../../terms.en-us.json';
import { useSubscription } from '../../../utilities/observables';
import { RoutedFC } from '../../../utilities/routing';
import { authProvider } from '../../authProvider';
import { MessageContext } from '../header/MessageContext';
import { Fields } from './Fields';

const Debug = lazy(() => import('./Debug').then(module => ({ default: module.Debug })));

export interface ITransferProps {
  encodedTransferToken: string;
}

export const Transfer: RoutedFC<ITransferProps> = ({ encodedTransferToken }) => {
  const messageContext = useContext(MessageContext);

  const transferFilesService = useDependency(ITransferFilesService);
  transferFilesService.messageContext = messageContext;

  const transfersService = useDependency(ITransfersService);
  transfersService.messageContext = messageContext;
  const transfer = useSubscription(transfersService.transfer);

  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState<string>();

  const transferToken = decodeURIComponent(encodedTransferToken || '');

  useEffect(() => {
    transfersService.getTransfer({ transferToken }).finally(() => setReady(true));
  }, [transfersService, transferToken]);

  useEffect(() => {
    if (transfer) {
      setTitle(transfer.name);

      transferFilesService.getFiles(transfer);
    }
  }, [transfer, transferFilesService]);

  return (
    <Segment basic>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {!ready && !transfer && <Loader active size='massive' />}
      {ready && transfer && (
        <>
          <Header as='h2' content={`${transferTerms.header} ${transfer.name}`} />
          <Fields />
          <AzureAD provider={authProvider}>
            <Debug />
          </AzureAD>
        </>
      )}
      {ready && !transfer && (
        <>
          <Header as='h2' content={transferTerms.invalid.header} />
          {transferTerms.invalid.explanation}
        </>
      )}
    </Segment>
  );
};
