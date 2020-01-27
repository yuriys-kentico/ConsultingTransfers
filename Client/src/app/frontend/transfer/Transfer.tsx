import React, { lazy, useCallback, useContext, useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { Header, Loader, Segment, Table } from 'semantic-ui-react';

import { navigate } from '@reach/router';

import { experience } from '../../../appSettings.json';
import { useDependency } from '../../../services/dependencyContainer';
import { ITransferFilesService } from '../../../services/TransferFilesService';
import { ITransfersService } from '../../../services/TransfersService';
import { transfer as transferTerms } from '../../../terms.en-us.json';
import { useSubscription } from '../../../utilities/observables';
import { wait } from '../../../utilities/promises';
import { RoutedFC } from '../../../utilities/routing';
import { format } from '../../../utilities/strings';
import { routes } from '../../routes';
import { ConfirmButton } from '../../shared/ConfirmButton';
import { Tooltip } from '../../shared/Tooltip';
import { Authenticated } from '../admin/Authenticated';
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
  const [title, setTitle] = useState(transferTerms.header);

  const transferToken = decodeURIComponent(encodedTransferToken || '');

  useEffect(() => {
    const getTransfer = transfersService.getTransfer({ transferToken }).finally(() => setReady(true));

    return () => {
      getTransfer.then(stopGetting => stopGetting());
    };
  }, [transfersService, transferToken]);

  useEffect(() => {
    if (transfer) {
      setTitle(transfer.name);

      transferFilesService.getFiles(transfer);
    }
  }, [transfer, transferFilesService]);

  const transfers = useSubscription(transfersService.transfers);
  const [suspendedTransferCodename, setSuspendedTransferCodename] = useState('');
  const [retry, setRetry] = useState(experience.detailsContainerCheckRetry);

  const suspendTransfer = useCallback(async () => {
    if (transfer && transfer.codename) {
      setReady(false);
      setSuspendedTransferCodename(transfer.codename);

      await transfersService.suspendTransfer({ transferToken });
    }
  }, [transfer, transferToken, transfersService]);

  useEffect(() => {
    if (suspendedTransferCodename !== '') {
      const transferSuspended =
        transfers && !transfers.some(transfer => transfer.codename === suspendedTransferCodename);

      if (transferSuspended) {
        navigate(routes.transfers);
      } else if (retry > 0) {
        wait(experience.transferSuspendTimeout).then(() => transfersService.listTransfers({}));
        setRetry(retry => retry--);
      }
    }
  }, [suspendedTransferCodename, transfers, transfersService, retry]);

  return (
    <Segment basic>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {!ready && <Loader active size='massive' />}
      {ready && transfer && (
        <>
          <Table basic='very'>
            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  <Header as='h2' content={`${transferTerms.header}: ${transfer.name}`} />
                </Table.Cell>
                <Authenticated>
                  <Table.Cell collapsing textAlign='right'>
                    <Tooltip label={transferTerms.tooltips.suspend}>
                      <ConfirmButton
                        buttonProps={{ icon: 'pause', color: 'orange' }}
                        confirmProps={{ content: format(transferTerms.confirm.suspend, transfer.name) }}
                        onConfirm={() => suspendTransfer()}
                      />
                    </Tooltip>
                  </Table.Cell>
                </Authenticated>
              </Table.Row>
            </Table.Body>
          </Table>
          <Fields />
          <Authenticated>
            <Debug />
          </Authenticated>
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
