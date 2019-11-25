const msalScript = document.createElement('script');
msalScript.src = 'https://alcdn.msauth.net/lib/1.1.3/js/msal.min.js';
msalScript.onload = () => getAccessToken();

document.head.appendChild(msalScript);

const getAccessToken = async () => {
  const msalConfig = {
    auth: {
      clientId: 'adc8d750-1763-4138-a133-1f14df05b5a8',
      authority: 'https://login.microsoftonline.com/kenticosoftware.onmicrosoft.com'
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true
    }
  };

  const accessTokenRequest = {
    scopes: ['adc8d750-1763-4138-a133-1f14df05b5a8/.default']
  };

  const userAgentApplication = new Msal.UserAgentApplication(msalConfig);

  try {
    await userAgentApplication.loginPopup(accessTokenRequest);
    const accessTokenResponse = await userAgentApplication.acquireTokenSilent(accessTokenRequest);
  } catch (error) {
    if (error.errorMessage.indexOf('interaction_required') !== -1) {
      const accessTokenResponse = await userAgentApplication.acquireTokenPopup(accessTokenRequest);
    }
  }
};
