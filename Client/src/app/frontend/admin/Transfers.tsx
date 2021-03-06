import React, { useCallback, useContext, useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { Button, Header, Loader, Segment, Table } from 'semantic-ui-react';

import { Link } from '@reach/router';

import { experience } from '../../../appSettings.json';
import { useDependency } from '../../../services/dependencyContainer';
import { ITransfer } from '../../../services/models/ITransfer';
import { ITransfersService } from '../../../services/TransfersService';
import { admin, transfer as transferTerms } from '../../../terms.en-us.json';
import { useSubscription } from '../../../utilities/observables';
import { wait } from '../../../utilities/promises';
import { authenticated, AuthenticatedRoutedFC, getTransferUrl } from '../../../utilities/routing';
import { format } from '../../../utilities/strings';
import { ConfirmButton } from '../../shared/ConfirmButton';
import { Tooltip } from '../../shared/Tooltip';
import { MessageContext } from '../header/MessageContext';

export const Transfers: AuthenticatedRoutedFC = authenticated(() => {
  const messageContext = useContext(MessageContext);

  const transfersService = useDependency(ITransfersService);
  transfersService.messageContext = messageContext;
  const transfers = useSubscription(transfersService.transfers);

  const [ready, setReady] = useState(false);
  const [retry, setRetry] = useState(experience.detailsContainerCheckRetry);

  useEffect(() => {
    transfersService.listTransfers({}).finally(() => setReady(true));
  }, [transfersService]);

  const [suspendedTransferCodename, setSuspendedTransferCodename] = useState('');

  const suspendTransfer = useCallback(
    async (transfer: ITransfer) => {
      const { codename, transferToken } = transfer;

      if (transfers && codename) {
        setReady(false);
        setSuspendedTransferCodename(codename);

        await transfersService.suspendTransfer({ transferToken });
      }
    },
    [transfers, transfersService]
  );

  useEffect(() => {
    if (suspendedTransferCodename !== '') {
      const transferSuspended =
        transfers && !transfers.some(transfer => transfer.codename === suspendedTransferCodename);

      if (transferSuspended) {
        setReady(true);
      } else if (retry > 0) {
        wait(experience.transferSuspendTimeout).then(() => transfersService.listTransfers({}));
        setRetry(retry => retry--);
      }
    }
  }, [suspendedTransferCodename, transfers, transfersService, retry]);

  const { header, table, invalid } = admin.transfers;

  return (
    <Segment basic>
      <Helmet>
        <title>{header}</title>
      </Helmet>
      <Header as='h2'>{header}</Header>
      {!ready && <Loader active size='massive' />}
      {ready && transfers && (
        <Table unstackable singleLine basic='very'>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{table.headings.region}</Table.HeaderCell>
              <Table.HeaderCell>{table.headings.transfer}</Table.HeaderCell>
              <Table.HeaderCell>{table.headings.customer}</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {transfers.map((transfer, index) => (
              <Table.Row key={index}>
                <Table.Cell>{transfer.region.toUpperCase()}</Table.Cell>
                <Table.Cell>{transfer.name}</Table.Cell>
                <Table.Cell>{transfer.customer}</Table.Cell>
                <Table.Cell textAlign='right'>
                  <Tooltip label={transferTerms.tooltips.edit}>
                    <Button icon='edit' color='blue' circular as={Link} to={getTransferUrl(transfer.transferToken)} />
                  </Tooltip>
                  <Tooltip label={transferTerms.tooltips.suspend}>
                    <ConfirmButton
                      buttonProps={{ icon: 'pause', color: 'orange' }}
                      confirmProps={{ content: format(transferTerms.confirm.suspend, transfer.name) }}
                      onConfirm={() => suspendTransfer(transfer)}
                    />
                  </Tooltip>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
      {ready && !transfers && (
        <>
          <Header as='h2' content={invalid.header} />
          {invalid.explanation}
        </>
      )}
    </Segment>
  );
});
