import { createContext } from 'react';

import { ISnack, SnackType } from './Snack';
import { UpdateSnackHandler } from './SnackBar';

export type ShowInfoHandler = (text: string, timeout?: number, type?: SnackType) => void;

export type ShowInfoUntilHandler = (message: string, executor: Promise<unknown>, update?: UpdateSnackHandler) => void;

export interface IAppHeaderContext extends IShowMessageHandlers {
  snacks: ISnack[];
}

export interface IShowMessageHandlers {
  showInfo: ShowInfoHandler;
  showInfoUntil: ShowInfoUntilHandler;
  showError: ShowInfoHandler;
  showSuccess: ShowInfoHandler;
  showWarning: ShowInfoHandler;
}

export const AppHeaderContext = createContext<IAppHeaderContext>({} as any);
