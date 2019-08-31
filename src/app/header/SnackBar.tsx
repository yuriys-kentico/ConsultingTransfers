import { FC, useContext, Dispatch, SetStateAction } from 'react';
import React from 'react';
import { Segment, Message } from 'semantic-ui-react';
import { AppHeaderContext, IAppHeaderContext } from './AppHeaderContext';

export interface ISnack {
  text: string;
  hide: HideSnackHandler;
  type: 'success' | 'info' | 'warning' | 'error';
}

export type HideSnackHandler = (headerContext: Dispatch<SetStateAction<IAppHeaderContext>>) => Promise<void>;

export type ShowSnackHandler = (
  text: string,
  type: 'success' | 'info' | 'warning' | 'error',
  hideSnackHandler: HideSnackHandler,
  setHeaderContext: React.Dispatch<React.SetStateAction<IAppHeaderContext>>
) => void;

export const SnackBar: FC = () => {
  const { snacks } = useContext(AppHeaderContext);

  return (
    <div className='snack bar'>
      {snacks.map((snack, index) => (
        <Segment basic key={index}>
          {(() => {
            switch (snack.type) {
              case 'success':
                return <Message floating compact content={snack.text} success />;
              case 'info':
                return <Message floating compact content={snack.text} info />;
              case 'warning':
                return <Message floating compact content={snack.text} warning />;
              case 'error':
                return <Message floating compact content={snack.text} error />;
            }
          })()}
        </Segment>
      ))}
    </div>
  );
};

export const showSnack: ShowSnackHandler = (text, type, hideSnackHandler, setHeaderContext) => {
  const newSnack: ISnack = {
    text: text,
    hide: hideSnackHandler,
    type: type
  };

  setHeaderContext(headerContext => {
    newSnack.hide(setHeaderContext);

    return {
      ...headerContext,
      snacks: [...headerContext.snacks, newSnack]
    };
  });
};

export const hideSnackWhen = (executor: Promise<unknown>) => async (
  setHeaderContext: Dispatch<SetStateAction<IAppHeaderContext>>
) => {
  await executor;

  setHeaderContext(headerContext => {
    headerContext.snacks.shift();

    return {
      ...headerContext,
      snacks: headerContext.snacks
    };
  });
};

export const hideSnackAfter = (timeout: number) =>
  hideSnackWhen(
    new Promise(resolve => {
      setTimeout(resolve, timeout);
    })
  );
