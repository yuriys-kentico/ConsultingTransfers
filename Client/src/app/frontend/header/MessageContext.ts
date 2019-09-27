import { createContext } from 'react';

import { ISnack, SnackType } from './Snack';
import { UpdateSnackHandler } from './snacks';

export type ShowInfoHandler = (text: string, timeout?: number, type?: SnackType) => void;

export type ShowErrorHandler = (error: any, timeout?: number) => void;

export type ShowInfoUntilHandler = <T>(text: string, executor: Promise<T>, update?: UpdateSnackHandler) => void;

export interface IMessageContext extends IMessageHandlers {
  snacks: ISnack[];
}

export interface IMessageHandlers {
  showSuccess: ShowInfoHandler;
  showInfo: ShowInfoHandler;
  showInfoUntil: ShowInfoUntilHandler;
  showWarning: ShowErrorHandler;
  showError: ShowErrorHandler;
}

const defaultShowInfoHandler = (text: any, _timeout?: number, _type?: SnackType) => console.log(text);
const defaultShowInfoUntilHandler = <T>(text: string, _executor: Promise<T>, _update?: UpdateSnackHandler) =>
  console.log(text);

export const MessageContext = createContext<IMessageContext>({
  showSuccess: defaultShowInfoHandler,
  showInfo: defaultShowInfoHandler,
  showInfoUntil: defaultShowInfoUntilHandler,
  showWarning: defaultShowInfoHandler,
  showError: defaultShowInfoHandler,
  snacks: []
});
