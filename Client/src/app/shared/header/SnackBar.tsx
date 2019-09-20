import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { Observable } from 'rxjs';

import { deleteFrom } from '../../../utilities/arrays';
import { promiseAfter } from '../../../utilities/promises';
import { AppHeaderContext, IAppHeaderContext } from './AppHeaderContext';
import { ISnack, IUpdateMessage, Snack, SnackType } from './Snack';

export type HideSnackHandler = (snack: ISnack, headerContext: Dispatch<SetStateAction<IAppHeaderContext>>) => void;

export type UpdateSnackHandler = Observable<IUpdateMessage>;

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
      {snacks.map(snack => (
        <Snack {...snack} />
      ))}
    </div>
  );
};

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

export const hideSnackWhen = <T extends {}>(executor: Promise<T>) => (
  snack: ISnack,
  setHeaderContext: Dispatch<SetStateAction<IAppHeaderContext>>
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
