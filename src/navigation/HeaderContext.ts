import { createContext } from 'react';

interface IHeaderContext {
  showMessage: (message: string) => void;
}

export const HeaderContext = createContext<IHeaderContext>({} as any);
