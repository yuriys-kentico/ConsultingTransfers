import { Parser } from 'html-to-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { Button, Divider, Form, Header, Message, Modal, Segment } from 'semantic-ui-react';

import { useDependency } from '../../../services/dependencyContainer';
import { ITransfersService } from '../../../services/TransfersService';
import { admin } from '../../../terms.en-us.json';
import { useSubscription } from '../../../utilities/observables';
import { authenticated, AuthenticatedRoutedFC } from '../../../utilities/routing';
import { MessageContext } from '../header/MessageContext';

export const NewTransfer: AuthenticatedRoutedFC = authenticated(() => {
  const {
    newTransfer: { header, fields, invalid, modal }
  } = admin;

  const [name, setName] = useState('');
  const [customer, setCustomer] = useState('');
  const [requester, setRequester] = useState('');
  const [template, setTemplate] = useState(fields.template.options[0].value);
  const [region, setRegion] = useState(fields.region.options[0].value);

  const [error, setError] = useState(false);
  const [ready, setReady] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const transfersService = useDependency(ITransfersService);
  transfersService.messageContext = useContext(MessageContext);

  const transfer = useSubscription(transfersService.transfer);

  useEffect(() => {
    if (transfer) {
      if (name && customer && requester) {
        setModalOpen(true);
      }

      setName('');
      setCustomer('');
      setRequester('');
    }
  }, [transfer, customer, name, requester]);

  const createTransfer = useCallback(async () => {
    if (name === '' || customer === '' || requester === '') {
      setError(true);
    } else if (name && customer && requester) {
      setError(false);
      setReady(false);

      await transfersService.createTransfer({ name, customer, requester, template, region });

      setReady(true);
    }
  }, [customer, name, region, requester, template, transfersService]);

  return (
    <Segment basic>
      <Helmet>
        <title>{header}</title>
      </Helmet>
      <Header as='h2'>{header}</Header>
      <Form error={error} onSubmit={createTransfer} loading={!ready} noValidate>
        <Form.Input
          label={fields.name.label}
          placeholder={fields.name.placeholder}
          required
          value={name}
          autoComplete='on'
          onChange={event => setName(event.target.value)}
          error={error && name === '' && { content: fields.name.invalid, pointing: 'below' }}
        />
        <Form.Input
          label={fields.customer.label}
          placeholder={fields.customer.placeholder}
          required
          value={customer}
          autoComplete='organization'
          onChange={event => setCustomer(event.target.value)}
          error={error && customer === '' && { content: fields.customer.invalid, pointing: 'below' }}
        />
        <Form.Input
          label={fields.requester.label}
          placeholder={fields.requester.placeholder}
          required
          value={requester}
          autoComplete='name'
          onChange={event => setRequester(event.target.value)}
          error={error && requester === '' && { content: fields.requester.invalid, pointing: 'below' }}
        />
        <Form.Select
          label={fields.template.label}
          options={fields.template.options}
          value={template}
          onChange={(_, data) => setTemplate(data.value as string)}
        />
        <Form.Select
          label={fields.region.label}
          options={fields.region.options}
          value={region}
          onChange={(_, data) => setRegion(data.value as string)}
        />
        <Message error content={invalid.fields} />
        <Form.Button>Create transfer</Form.Button>
      </Form>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {transfer && (
          <>
            <Header content={transfer.name} />
            {transfer.template && (
              <Modal.Content>
                {modal.template}:
                <Divider hidden />
                <div className='clean template'>{new Parser().parse(transfer.template)}</div>
              </Modal.Content>
            )}
          </>
        )}
        <Modal.Actions>
          <Button content={modal.close} onClick={() => setModalOpen(false)} />
        </Modal.Actions>
      </Modal>
    </Segment>
  );
});
