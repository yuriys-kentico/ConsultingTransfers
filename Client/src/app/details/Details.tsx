import './details.css';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { Input, Label, Loader, Table } from 'semantic-ui-react';

import { navigate } from '@reach/router';

import { experience, kenticoKontent } from '../../appSettings.json';
import { useDependency } from '../../services/dependencyContainer';
import { ITransfersService } from '../../services/TransfersService';
import { details } from '../../terms.en-us.json';
import { loadModule } from '../../utilities/modules';
import { useSubscription } from '../../utilities/observables';
import { wait } from '../../utilities/promises';
import { authenticatedPopup, AuthenticatedRoutedFC, getTransferUrl } from '../../utilities/routing';
import { MessageContext } from '../frontend/header/MessageContext';
import { routes } from '../routes';
import { Element, ICustomElement } from './customElement';

// Expose access to Kentico custom element API
declare const CustomElement: ICustomElement;

interface IDetailsValue {
  customer: string;
  requester: string;
}

interface IDetailsProps {
  region: string;
}

const defaultDetailsValue: IDetailsValue = { customer: '', requester: '' };

const getUrl = (path: string) => {
  return `${window.location.protocol}//${window.location.host}${path}`;
};

export const Details: AuthenticatedRoutedFC<IDetailsProps> = authenticatedPopup(({ region }) => {
  if (window.self === window.top) {
    navigate('/');
  }

  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(false);
  const [customer, setCustomer] = useState('');
  const [requester, setRequester] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [transferToken, setTransferToken] = useState('');
  const [codename, setCodename] = useState('');
  const [retry, setRetry] = useState(experience.detailsContainerCheckRetry);

  const customElementRef = useRef<HTMLDivElement>(null);

  const transfersService = useDependency(ITransfersService);
  transfersService.messageContext = useContext(MessageContext);
  const transfers = useSubscription(transfersService.transfers);

  useEffect(() => {
    const initCustomElement = (element: Element) => {
      const elementValue = JSON.parse(element.value || JSON.stringify(defaultDetailsValue)) as IDetailsValue;

      setAvailable(true);
      setCustomer(elementValue.customer || '');
      setRequester(elementValue.requester || '');
      setEnabledAndListTransfers(!element.disabled);

      CustomElement.onDisabledChanged(disabled => setEnabledAndListTransfers(!disabled));
    };

    const setEnabledAndListTransfers = (enabled: boolean) => {
      setEnabled(enabled);
      setReady(false);

      if (!enabled) {
        CustomElement.init((_, context) => {
          setCodename(context.item.codename);
          transfersService.listTransfers({ region });
        });
      }
    };

    loadModule(kenticoKontent.customElementScriptEndpoint, () => CustomElement.init(initCustomElement));
  }, [region, transfersService]);

  useEffect(() => {
    const transfer = transfers && transfers.find(transfer => transfer.codename === codename);

    if (transfer && transfer.transferToken) {
      setTransferToken(transfer.transferToken);
      setReady(true);
    } else if (retry > 0) {
      wait(experience.detailsContainerCheckTimeout).then(() => transfersService.listTransfers({ region }));
      setRetry(retry => retry--);
    }
  }, [codename, region, transfers, transfersService, retry]);

  useEffect(() => {
    if (available && customElementRef.current) {
      CustomElement.setHeight(customElementRef.current.scrollHeight);
    }
  });

  useEffect(() => {
    if (available && enabled) {
      CustomElement.setValue(JSON.stringify({ customer, requester }));
    }
  }, [available, enabled, customer, requester]);

  return (
    <div className={`custom element ${enabled ? '' : 'disabled'}`} ref={customElementRef}>
      {!available && <Loader active size='massive' />}
      {available && (
        <>
          <div className='text element'>
            <div className='pane'>
              <label className='label'>{details.customer.header}</label>
              <div className='guidelines'>
                <p>{details.customer.guidelines}</p>
              </div>
              <Input
                className='input'
                size='big'
                fluid
                value={customer}
                onChange={event => setCustomer(event.target.value)}
                placeholder={details.placeholder}
                disabled={!enabled}
              />
            </div>
          </div>
          <div className='text element'>
            <div className='pane'>
              <label className='label'>{details.requester.header}</label>
              <div className='guidelines'>
                <p>{details.requester.guidelines}</p>
              </div>
              <Input
                className='input'
                size='big'
                fluid
                value={requester}
                onChange={event => setRequester(event.target.value)}
                placeholder={details.placeholder}
                disabled={!enabled}
              />
            </div>
          </div>
          {!enabled && (
            <>
              {!ready && <Loader active size='massive' />}
              {ready && (
                <div className='element'>
                  <div className='pane'>
                    <label className='label'>{details.container.header}</label>
                    <Table unstackable basic='very' compact>
                      <Table.Body>
                        <Table.Row>
                          <Table.Cell collapsing>
                            <Label horizontal>{details.container.adminUrl}</Label>
                          </Table.Cell>
                          <Table.Cell>
                            <a href={getUrl(routes.transfers)} target='_blank' rel='noopener noreferrer'>
                              {getUrl(routes.transfers)}
                            </a>
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell collapsing>
                            <Label horizontal>{details.container.publicUrl}</Label>
                          </Table.Cell>
                          <Table.Cell>
                            <a href={getUrl(getTransferUrl(transferToken))} target='_blank' rel='noopener noreferrer'>
                              {getUrl(getTransferUrl(transferToken))}
                            </a>
                          </Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>
                  </div>
                </div>
              )}
              {!ready && retry === 0 && (
                <div className='element'>
                  <div className='pane'>
                    <label className='label'>{details.invalid.header}</label>
                    {details.invalid.explanation}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
});
