import { ISnack } from './SnackBar';
import { createContext } from 'react';

export interface IHeaderContext {
  showMessage: (message: string) => void;
  snacks: ISnack[];
}

export const HeaderContext = createContext<IHeaderContext>({} as any);
