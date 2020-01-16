import { Configuration } from 'msal';
import { LoginType, MsalAuthProvider } from 'react-aad-msal';

import { authentication } from '../appSettings.json';

const { config, accessTokenRequest } = authentication;

config.auth.redirectUri = window.location.origin;

export const authProvider = new MsalAuthProvider(config as Configuration, accessTokenRequest, {
  loginType: LoginType.Redirect
});

export const authProviderPopup = new MsalAuthProvider(config as Configuration, accessTokenRequest, {
  loginType: LoginType.Popup
});
