import { ReactNode } from 'react';
import { Observable } from 'rxjs';

import { experience } from '../../../appSettings.json';
import { wait } from '../../../utilities/promises';

export type SnackType = 'success' | 'info' | 'warning' | 'error' | 'update';

export interface ISnack {
  content: ReactNode;
  type: SnackType;
  abort?: () => void;
  update?: UpdateStream;
  key?: number;
}

export interface IUpdateMessage {
  current: number;
  total: number;
}

export type UpdateStream = Observable<IUpdateMessage>;

export const showSnack = async <T>(
  content: ReactNode,
  type: SnackType,
  addSnack: (snack: ISnack) => void,
  isComplete: Promise<T>,
  hideSnack: (snack: ISnack) => void,
  abort?: () => void,
  updateStream?: Observable<IUpdateMessage>
) => {
  const { snackTimeout } = experience;

  const newSnack: ISnack = {
    content,
    type,
    update: updateStream,
    abort,
    key: Math.random()
  };

  addSnack(newSnack);

  try {
    await isComplete;
  } catch {
  } finally {
    await wait(snackTimeout);
    hideSnack(newSnack);
  }
};
