import { ISnack } from './SnackBar';
import { createContext } from 'react';
import { ShowInfoHandler, ShowInfoUntilHandler } from './AppHeader';

export interface IAppHeaderContext {
  snacks: ISnack[];
  showInfo: ShowInfoHandler;
  showInfoUntil: ShowInfoUntilHandler;
  showError: ShowInfoHandler;
  showSuccess: ShowInfoHandler;
  showWarning: ShowInfoHandler;
}

export const AppHeaderContext = createContext<IAppHeaderContext>({} as any);
