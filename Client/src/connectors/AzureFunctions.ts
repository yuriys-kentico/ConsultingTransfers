import Axios from 'axios';
import { MsalAuthProvider } from 'react-aad-msal';

import { IShowMessageHandlers } from '../app/shared/header/AppHeaderContext';

export interface ITransfer {
  customer: string;
  requester: string;
  containerToken: string;
  fields: string;
  system: {
    name: string;
    codename: string;
  };
}

export interface IListTransfersResponse {
  transfers: ITransfer[];
}

export interface IGetTransferResponse {
  sasToken: string;
  containerName: string;
  transfer: ITransfer;
}

export const getTransferUrl = (containerToken: string) => `/transfer/${encodeURIComponent(containerToken)}`;
export const getTransfersUrl = (containerToken: string) => `/transfers/${encodeURIComponent(containerToken)}`;

const getAuthorizationHeaders = (key: string, bearerToken?: string) => {
  return bearerToken
    ? {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'x-functions-key': key
        }
      }
    : {
        headers: {
          'x-functions-key': key
        }
      };
};

const listTransfers = async (
  accountName: string,
  listTransfers: { endpoint: string; key: string },
  authProvider: MsalAuthProvider,
  messageHandlers: IShowMessageHandlers,
  detailsKey?: string
) => {
  const { showError } = messageHandlers;
  const bearerToken = detailsKey ? detailsKey : (await authProvider.getAccessToken()).accessToken;

  try {
    const response = await Axios.post<IListTransfersResponse>(
      listTransfers.endpoint,
      { accountName },
      getAuthorizationHeaders(listTransfers.key, bearerToken)
    );

    return response.data.transfers;
  } catch (error) {
    showError((error.body && error.body.message) || error.message);
  }
};

const getTransfer = async (
  accountName: string,
  getTransfer: { endpoint: string; key: string },
  authProvider: MsalAuthProvider,
  containerToken: string,
  messageHandlers: IShowMessageHandlers
) => {
  const { showError } = messageHandlers;
  const bearerToken = !authProvider ? undefined : (await authProvider.getAccessToken()).accessToken;

  try {
    const response = await Axios.post<IGetTransferResponse>(
      getTransfer.endpoint,
      { accountName, containerToken },
      getAuthorizationHeaders(getTransfer.key, bearerToken)
    );

    return response.data;
  } catch (error) {
    showError((error.body && error.body.message) || error.message);
  }
};

export const AzureFunctions = {
  listTransfers,
  getTransfer
};
