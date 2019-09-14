import { createContext } from 'react';
import { MsalAuthProvider } from 'react-aad-msal';

export interface IAuthenticatedContext {
  authProvider: MsalAuthProvider;
}

export const AuthenticatedContext = createContext<IAuthenticatedContext>({} as any);
