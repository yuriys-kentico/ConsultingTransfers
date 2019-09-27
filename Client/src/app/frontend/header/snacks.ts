import { Dispatch, SetStateAction } from 'react';
import { Observable } from 'rxjs';

import { deleteFrom } from '../../../utilities/arrays';
import { promiseAfter } from '../../../utilities/promises';
import { IMessageContext } from './MessageContext';
import { ISnack, IUpdateMessage, SnackType } from './Snack';

export type HideSnackHandler = (snack: ISnack, headerContext: Dispatch<SetStateAction<IMessageContext>>) => void;

export type UpdateSnackHandler = Observable<IUpdateMessage>;

export type ShowSnackHandler = (
  setHeaderContext: Dispatch<SetStateAction<IMessageContext>>,
  text: string,
  type: SnackType,
  hideSnackHandler: HideSnackHandler,
  updateSnackHandler?: UpdateSnackHandler
) => void;

export const showSnack: ShowSnackHandler = (setHeaderContext, text, type, hideSnackHandler, updateSnackHandler) => {
  const newSnack: ISnack = {
    text: text,
    type: type,
    update: updateSnackHandler,
    key: Math.random()
  };

  setHeaderContext(headerContext => {
    hideSnackHandler(newSnack, setHeaderContext);

    return {
      ...headerContext,
      snacks: [...headerContext.snacks, newSnack]
    };
  });
};

export const hideSnackWhen = <T>(executor: Promise<T>) => (
  snack: ISnack,
  setHeaderContext: Dispatch<SetStateAction<IMessageContext>>
) => {
  executor.then(() => {
    setHeaderContext(headerContext => {
      return {
        ...headerContext,
        snacks: deleteFrom(snack, headerContext.snacks)
      };
    });
  });
};

export const hideSnackAfter = (timeout: number) => hideSnackWhen(promiseAfter(timeout)({}));
