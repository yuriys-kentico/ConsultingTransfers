import { Dispatch, SetStateAction } from 'react';
import { Observable } from 'rxjs';

import { deleteFrom } from '../../../utilities/arrays';
import { promiseAfter } from '../../../utilities/promises';
import { ISnack, IUpdateMessage, SnackType } from './Snack';

type ShowSnackHandler = (
  setSnacks: Dispatch<SetStateAction<ISnack[]>>,
  text: string,
  type: SnackType,
  hideSnackHandler: HideSnackHandler,
  updateSnackHandler?: UpdateSnackHandler
) => void;

type HideSnackHandler = (snack: ISnack, setSnacks: Dispatch<SetStateAction<ISnack[]>>) => void;

export type UpdateSnackHandler = Observable<IUpdateMessage>;

type HideSnackWhenHandler = <T>(
  executor: Promise<T>
) => (snack: ISnack, setSnacks: Dispatch<SetStateAction<ISnack[]>>) => void;

export const showSnack: ShowSnackHandler = (setSnacks, text, type, hideSnackHandler, updateSnackHandler) => {
  const newSnack: ISnack = {
    text: text,
    type: type,
    update: updateSnackHandler,
    key: Math.random()
  };

  setSnacks(snacks => {
    hideSnackHandler(newSnack, setSnacks);

    return [...snacks, newSnack];
  });
};

export const hideSnackWhen: HideSnackWhenHandler = executor => (snack, setSnacks) => {
  executor.then(() => {
    setSnacks(snacks => {
      return deleteFrom(snack, snacks);
    });
  });
};

export const hideSnackAfter = (timeout: number) => hideSnackWhen(promiseAfter(timeout)({}));
