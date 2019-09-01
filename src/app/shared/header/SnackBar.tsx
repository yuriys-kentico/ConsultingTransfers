import { FC, useContext, Dispatch, SetStateAction } from 'react';
import React from 'react';
import { Segment } from 'semantic-ui-react';
import { AppHeaderContext, IAppHeaderContext } from './AppHeaderContext';
import { Observable } from 'rxjs';
import { Snack } from './Snack';

export type SnackType = 'success' | 'info' | 'warning' | 'error' | 'update';

export interface ISnack {
  text: string;
  type: SnackType;
  hide: HideSnackHandler;
  update?: UpdateSnackHandler;
}

export type HideSnackHandler = (headerContext: Dispatch<SetStateAction<IAppHeaderContext>>) => Promise<void>;

export type UpdateSnackHandler = Observable<{ progress: number; text: string }>;

export type ShowSnackHandler = (
  setHeaderContext: React.Dispatch<React.SetStateAction<IAppHeaderContext>>,
  text: string,
  type: SnackType,
  hideSnackHandler: HideSnackHandler,
  updateSnackHandler?: UpdateSnackHandler
) => void;

export const SnackBar: FC = () => {
  const { snacks } = useContext(AppHeaderContext);

  return (
    <div className='snack bar'>
      {snacks.map((snack, index) => (
        <Segment basic key={index}>
          <Snack {...snack} />
        </Segment>
      ))}
    </div>
  );
};

export const showSnack: ShowSnackHandler = (setHeaderContext, text, type, hideSnackHandler, updateSnackHandler) => {
  const newSnack: ISnack = {
    text: text,
    type: type,
    hide: hideSnackHandler,
    update: updateSnackHandler
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

export const hideSnackAfter = (timeout: number) => hideSnackWhen(new Promise(resolve => setTimeout(resolve, timeout)));
