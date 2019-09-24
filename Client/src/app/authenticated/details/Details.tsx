import './details.css';

import { navigate } from '@reach/router';
import React, { ChangeEvent, Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Input, Label, List, Loader } from 'semantic-ui-react';

import { experience, kenticoKontent, terms } from '../../../appSettings.json';
import { AzureFunctions, getTransfersUrl, getTransferUrl } from '../../../connectors/AzureFunctions';
import { Element, ICustomElement } from '../../../connectors/customElement';
import { promiseAfter, promiseWhile } from '../../../utilities/promises';
import { RoutedFC } from '../../RoutedFC';
import { AppHeaderContext } from '../../shared/header/AppHeaderContext';
import { AuthenticatedContext } from '../AuthenticatedContext';

// Expose access to Kentico custom element API
declare const CustomElement: ICustomElement;

interface IDetailsValue {
  customer: string;
  requester: string;
}

const defaultDetailsValue: IDetailsValue = { customer: '', requester: '' };

export const Details: RoutedFC = () => {
  if (window.self === window.top) {
    navigate('/');
  }

  const appHeaderContext = useContext(AppHeaderContext);
  const { authProvider } = useContext(AuthenticatedContext);

  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [customer, setCustomer] = useState('');
  const [requester, setRequester] = useState('');
  const [containerToken, setContainerToken] = useState();

  const customElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const customElementModule = document.createElement('script');

    customElementModule.src = kenticoKontent.customElementScriptEndpoint;
    customElementModule.onload = () => CustomElement.init(initCustomElement);

    const initCustomElement = (element: Element) => {
      const elementValue = JSON.parse(element.value || JSON.stringify(defaultDetailsValue)) as IDetailsValue;

      setAvailable(true);
      setCustomer(elementValue.customer);
      setRequester(elementValue.requester);

      // TODO: Pending MSAL in iframe: https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/899
      const key = (element.config as { key: string }).key;

      setEnabledAndRetrieveToken(!element.disabled, key);

      CustomElement.onDisabledChanged(disabled => setEnabledAndRetrieveToken(!disabled, key));
    };

    const setEnabledAndRetrieveToken = (enabled: boolean, key: string) => {
      setEnabled(enabled);

      if (!enabled) {
        setContainerToken(undefined);

        const checkContainerToken = (codename: string) => () =>
          AzureFunctions.listTransfers(authProvider, appHeaderContext, key)
            .then(transfers => {
              const transfer = transfers && transfers.filter(transfer => transfer.system.codename === codename)[0];

              if (transfer && transfer.containerToken) {
                setContainerToken(transfer.containerToken);
                return true;
              } else {
                return false;
              }
            })
            .then(promiseAfter(experience.detailsContainerCheckTimeout));

        CustomElement.init((_, context) =>
          promiseWhile(false, tokenIsSet => tokenIsSet === false, checkContainerToken(context.item.codename))
        );
      }
    };

    document.head.appendChild(customElementModule);
  }, [authProvider, appHeaderContext]);

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

  const updateStringField = (setStater: Dispatch<SetStateAction<string>>) => (event: ChangeEvent<HTMLInputElement>) => {
    setStater(event.target.value);
  };

  const getUrl = (path: string) => {
    return `${window.location.protocol}//${window.location.host}${path}`;
  };

  const { details } = terms;

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
                onChange={updateStringField(setCustomer)}
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
                onChange={updateStringField(setRequester)}
                placeholder={details.placeholder}
                disabled={!enabled}
              />
            </div>
          </div>
          {enabled ? null : !containerToken ? (
            <Loader active size='massive' />
          ) : (
            <div className='element'>
              <div className='pane'>
                <label className='label'>{details.container.header}</label>
                <List>
                  <List.Item>
                    <Label horizontal>{details.container.publicUrl}</Label>
                    <a href={getUrl(getTransferUrl(containerToken))} target='_blank' rel='noopener noreferrer'>
                      {getUrl(getTransferUrl(containerToken))}
                    </a>
                  </List.Item>
                  <List.Item>
                    <Label horizontal>{details.container.adminUrl}</Label>
                    <a href={getUrl(getTransfersUrl(containerToken))} target='_blank' rel='noopener noreferrer'>
                      {getUrl(getTransfersUrl(containerToken))}
                    </a>
                  </List.Item>
                </List>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
