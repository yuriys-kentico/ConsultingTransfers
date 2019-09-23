import { createContext } from 'react';

import { ISnack, SnackType } from './Snack';
import { UpdateSnackHandler } from './SnackBar';

export type ShowInfoHandler = (text: string, timeout?: number, type?: SnackType) => void;

export type ShowInfoUntilHandler = <T>(text: string, executor: Promise<T>, update?: UpdateSnackHandler) => void;

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

const defaultShowInfoHandler = (text: string, _timeout?: number, _type?: SnackType) => console.log(text);
const defaultShowInfoUntilHandler = <T>(text: string, _executor: Promise<T>, _update?: UpdateSnackHandler) =>
  console.log(text);
export const AppHeaderContext = createContext<IAppHeaderContext>({
  showInfo: defaultShowInfoHandler,
  showInfoUntil: defaultShowInfoUntilHandler,
  showError: defaultShowInfoHandler,
  showSuccess: defaultShowInfoHandler,
  showWarning: defaultShowInfoHandler,
  snacks: []
});
