import './details.css';

import { navigate } from '@reach/router';
import Axios from 'axios';
import React, { ChangeEvent, Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Input, Label, List, Loader } from 'semantic-ui-react';

import { IRequestListerResponse } from '../../../connectors/azureFunctions/IRequestListerResponse';
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

  const context = useContext(AppContext);

  const {
    terms: { details }
  } = context;

  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [accountNameValue, setAccountNameValue] = useState('');
  const [requesterValue, setRequesterValue] = useState('');
  const [containerToken, setContainerToken] = useState();

  const customElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const {
      kenticoKontent: { customElementScriptEndpoint },
      azureStorage: { accountName, requestLister },
      experience
    } = context;

    const customElementModule = document.createElement('script');

    customElementModule.src = customElementScriptEndpoint;
    customElementModule.onload = () => CustomElement.init(initCustomElement);

    const initCustomElement = (element: Element) => {
      const elementValue = JSON.parse(element.value || JSON.stringify(defaultDetailsValue)) as IDetailsValue;

      setAvailable(true);
      setAccountNameValue(elementValue.accountName);
      setRequesterValue(elementValue.requester);
      setEnabledAndRetrieveToken(!element.disabled);

      CustomElement.onDisabledChanged(disabled => setEnabledAndRetrieveToken(!disabled));
    };

    const setEnabledAndRetrieveToken = (enabled: boolean) => {
      setEnabled(enabled);

      if (!enabled) {
        setContainerToken(undefined);

        //authProvider.getAccessToken().then(response => {
        const checkContainerToken = (codename: string) => () =>
          Axios.post<IRequestListerResponse>(
            requestLister.endpoint,
            { accountName },
            getAuthorizationHeaders(requestLister.key, 'accessToken')
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
  }, [context]);

  useEffect(() => {
    if (available && customElementRef.current) {
      CustomElement.setHeight(customElementRef.current.scrollHeight);
    }
  });

  useEffect(() => {
    if (available) {
      CustomElement.setValue(JSON.stringify({ accountName: accountNameValue, requester: requesterValue }));
    }
  }, [available, accountNameValue, requesterValue]);

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
              <label className='label'>{details.accountName.header}</label>
              <div className='guidelines'>
                <p>{details.accountName.guidelines}</p>
              </div>
              <Input
                className='input'
                size='big'
                fluid
                value={accountNameValue}
                onChange={updateStringField(setAccountNameValue)}
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
                value={requesterValue}
                onChange={updateStringField(setRequesterValue)}
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
                    <a href={getUrl(`/transfer/${containerToken}`)} target='_blank' rel='noopener noreferrer'>
                      {getUrl(`/transfer/${containerToken}`)}
                    </a>
                  </List.Item>
                  <List.Item>
                    <Label horizontal>{details.container.adminUrl}</Label>
                    <a href={getUrl(`/transfers/${containerToken}`)} target='_blank' rel='noopener noreferrer'>
                      {getUrl(`/transfers/${containerToken}`)}
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
