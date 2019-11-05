const msalScript = document.createElement('script');

msalScript.src = 'https://alcdn.msauth.net/lib/1.1.3/js/msal.min.js';
msalScript.onload = () => getAccessToken();

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

  const requestObj = {
    scopes: ['adc8d750-1763-4138-a133-1f14df05b5a8/.default']
  };

  const myMSALObj = new Msal.UserAgentApplication(msalConfig);

  await myMSALObj.loginPopup(requestObj);

  const tokenResponse = await myMSALObj.acquireTokenSilent(requestObj);

  console.log(tokenResponse);
};

document.head.appendChild(msalScript);
