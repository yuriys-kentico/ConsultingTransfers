import { navigate } from '@reach/router';
import React, { useContext, useEffect } from 'react';

import { AppContext } from '../../AppContext';
import { RoutedFC } from '../../RoutedFC';
import { ICustomElement } from './customElement/CustomElement';

// Expose access to Kentico custom element API
declare const CustomElement: ICustomElement;

export const Details: RoutedFC = () => {
  if (window.self === window.top) {
    navigate('/');
  }

  const {
    kenticoCloud: { customElementScriptEndpoint }
  } = useContext(AppContext);

  useEffect(() => {
    const customElementModule = document.createElement('script');
    customElementModule.type = 'text/javascript';
    customElementModule.async = true;
    customElementModule.src = customElementScriptEndpoint;

    document.head.appendChild(customElementModule);

    customElementModule.onload = () => {
      CustomElement.init((element, context) => {
        console.log(element, element.value);
      });
    };
  }, []);

  return <div>test</div>;
};
