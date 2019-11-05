import './details.css';

import { navigate } from '@reach/router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Input, Label, Loader, Table } from 'semantic-ui-react';

import { experience, kenticoKontent } from '../../appSettings.json';
import { IAzureFunctionsService } from '../../services/azureFunctions/AzureFunctionsService';
import { useDependency } from '../../services/dependencyContainer';
import { details } from '../../terms.en-us.json';
import { useSubscription } from '../../utilities/observables';
import { promiseAfter } from '../../utilities/promises';
import { getTransferUrl, RoutedFC } from '../../utilities/routing';
import { MessageContext } from '../frontend/header/MessageContext';
import { routes } from '../routes';
import { Element, ICustomElement } from './customElement';

// Expose access to Kentico custom element API
declare const CustomElement: ICustomElement;

interface IDetailsValue {
  customer: string;
  requester: string;
}

interface IDetailsConfig {
  key: string;
  region: string;
}

const defaultDetailsValue: IDetailsValue = { customer: '', requester: '' };

export const Details: RoutedFC = () => {
  if (window.self === window.top) {
    navigate('/');
  }

  const [available, setAvailable] = useState(false);
  const [customer, setCustomer] = useState('');
  const [requester, setRequester] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [transferToken, setTransferToken] = useState<string>();
  const [codename, setCodename] = useState('');

  const customElementRef = useRef<HTMLDivElement>(null);
  const customElementConfig = useRef<IDetailsConfig>({ key: '', region: '' });

  const azureFunctionsService = useDependency(IAzureFunctionsService);
  azureFunctionsService.messageContext = useContext(MessageContext);

  useEffect(() => {
    const customElementModule = document.createElement('script');

    customElementModule.src = kenticoKontent.customElementScriptEndpoint;
    customElementModule.onload = () => CustomElement.init(initCustomElement);

    const initCustomElement = (element: Element) => {
      const elementValue = JSON.parse(element.value || JSON.stringify(defaultDetailsValue)) as IDetailsValue;

      setAvailable(true);
      setCustomer(elementValue.customer || '');
      setRequester(elementValue.requester || '');

      // TODO: Pending MSAL in iframe: https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/899
      customElementConfig.current = element.config as IDetailsConfig;

      setEnabledAndRetrieveToken(!element.disabled);

      CustomElement.onDisabledChanged(disabled => setEnabledAndRetrieveToken(!disabled));
    };

    const setEnabledAndRetrieveToken = (enabled: boolean) => {
      setEnabled(enabled);

      if (!enabled) {
        setTransferToken(undefined);

        CustomElement.init((_, context) => {
          setCodename(context.item.codename);
          azureFunctionsService.listTransfers(customElementConfig.current.region, customElementConfig.current.key);
        });
      }
    };

    document.head.appendChild(customElementModule);
  }, [azureFunctionsService]);

  const transfers = useSubscription(azureFunctionsService.transfers);

  if (transfers) {
    const transfer = transfers.filter(transfer => transfer.codename === codename)[0];

    if (transfer && transfer.transferToken && !transferToken) {
      setTransferToken(transfer.transferToken);
    } else if (customElementConfig.current.key) {
      promiseAfter(experience.detailsContainerCheckTimeout)(() =>
        azureFunctionsService.listTransfers(customElementConfig.current.region, customElementConfig.current.key)
      );
    }
  }

  useEffect(() => {
    if (available && customElementRef.current) {
      CustomElement.setHeight(customElementRef.current.scrollHeight);
    }
  });

  useEffect(() => {
    if (available) {
      CustomElement.setValue(JSON.stringify({ customer, requester }));
    }
  }, [available, customer, requester]);

  const getUrl = (path: string) => {
    return `${window.location.protocol}//${window.location.host}${path}`;
  };

  return (
    <div className={`custom element ${enabled ? '' : 'disabled'}`} ref={customElementRef}>
      {!available ? (
        <Loader active size='massive' />
      ) : (
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
          {enabled ? null : !transferToken ? (
            <Loader active size='massive' />
          ) : (
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
        </>
      )}
    </div>
  );
};
