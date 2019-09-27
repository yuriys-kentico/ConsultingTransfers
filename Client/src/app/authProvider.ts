import { Configuration, LoginType, MsalAuthProvider } from 'react-aad-msal';

import { authentication } from '../appSettings.json';

const { config, accessTokenRequest } = authentication;

config.auth.redirectUri = window.location.origin;

export const authProvider = new MsalAuthProvider(config as Configuration, accessTokenRequest, LoginType.Redirect);
