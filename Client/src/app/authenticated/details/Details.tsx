import './details.css';

import { navigate } from '@reach/router';
import Axios from 'axios';
import React, { ChangeEvent, Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Input, Label, List, Loader } from 'semantic-ui-react';

import { getTransfersUrl, getTransferUrl, IRequestListerResponse } from '../../../connectors/azure/requests';
import { Context, Element, ICustomElement } from '../../../connectors/customElement/customElement';
import { promiseAfter, promiseWhile } from '../../../utilities/promises';
import { getAuthorizationHeaders } from '../../../utilities/requests';
import { AppContext } from '../../AppContext';
import { RoutedFC } from '../../RoutedFC';

// Expose access to Kentico custom element API
declare const CustomElement: ICustomElement;

interface IDetailsValue {
  accountName: string;
  requester: string;
}

const defaultDetailsValue = { accountName: '', requester: '' };

export const Details: RoutedFC = () => {
  if (window.self === window.top) {
    navigate('/');
  }

  const appContext = useContext(AppContext);

  const { details } = appContext.terms;

  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [crmAccountName, setCrmAccountName] = useState('');
  const [requester, setRequester] = useState('');
  const [containerToken, setContainerToken] = useState();

  const customElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const {
      kenticoKontent: { customElementScriptEndpoint },
      azureStorage: { accountName, requestLister },
      experience
    } = appContext;

    const customElementModule = document.createElement('script');

    customElementModule.src = customElementScriptEndpoint;
    customElementModule.onload = () => CustomElement.init(initCustomElement);

    const initCustomElement = (element: Element) => {
      const elementValue = JSON.parse(element.value || JSON.stringify(defaultDetailsValue)) as IDetailsValue;

      setAvailable(true);
      setCrmAccountName(elementValue.accountName);
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

        //authProvider.getAccessToken().then(({accessToken}) => {
        const checkContainerToken = (codename: string) => () =>
          Axios.post<IRequestListerResponse>(
            requestLister.endpoint,
            { accountName },
            getAuthorizationHeaders(requestLister.key, key) // accessToken)
          )
            .then(response => {
              const request = response.data.requestItems.filter(request => request.system.codename === codename)[0];

              if (request && request.containerToken) {
                return request.containerToken;
              } else {
                return '';
              }
            })
            .then(promiseAfter(experience.detailsContainerCheckTimeout));

        CustomElement.init((_, context: Context) => {
          promiseWhile(
            '',
            containerToken => containerToken.length === 0,
            checkContainerToken(context.item.codename)
          ).then(containerToken => setContainerToken(containerToken));
        });
        //});
      }
    };

    document.head.appendChild(customElementModule);
  }, [appContext]);

  useEffect(() => {
    if (available && customElementRef.current) {
      CustomElement.setHeight(customElementRef.current.scrollHeight);
    }
  });

  useEffect(() => {
    if (available) {
      CustomElement.setValue(JSON.stringify({ crmAccountName, requester }));
    }
  }, [available, crmAccountName, requester]);

  const updateStringField = (setStater: Dispatch<SetStateAction<string>>) => (event: ChangeEvent<HTMLInputElement>) => {
    setStater(event.target.value);
  };

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
              <label className='label'>{details.crmAccountName.header}</label>
              <div className='guidelines'>
                <p>{details.crmAccountName.guidelines}</p>
              </div>
              <Input
                className='input'
                size='big'
                fluid
                value={crmAccountName}
                onChange={updateStringField(setCrmAccountName)}
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
