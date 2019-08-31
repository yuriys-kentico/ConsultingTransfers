import { ISnack } from './SnackBar';
import { createContext } from 'react';

export interface IAppHeaderContext {
  snacks: ISnack[];
  showInfo: (message: string, timeout?: number) => void;
  showInfoUntil: (message: string, executor: Promise<unknown>) => void;
  showError: (message: string, timeout?: number) => void;
}

export const AppHeaderContext = createContext<IAppHeaderContext>({} as any);
