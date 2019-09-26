import Axios from 'axios';
import { MsalAuthProvider } from 'react-aad-msal';
import { BehaviorSubject } from 'rxjs';

import { IMessageHandlers } from '../../app/shared/header/MessageContext';
import { getTransfer, listTransfers, region } from '../../transfers.json';
import { IGetTransferDetails, IListTransfers, ITransfer } from './azureFunctions';

export const IAzureFunctionsService = 'IAzureFunctionsService';

export interface IAzureFunctionsService {
  transfers: BehaviorSubject<ITransfer[]>;
  transferDetails: BehaviorSubject<IGetTransferDetails>;

  listTransfers(authProvider: MsalAuthProvider, messageHandlers: IMessageHandlers, detailsKey?: string): Promise<void>;
  getTransferDetails(
    authProvider: MsalAuthProvider,
    containerToken: string,
    messageHandlers: IMessageHandlers
  ): Promise<void>;
}

export class AzureFunctionsService implements IAzureFunctionsService {
  transfers: BehaviorSubject<ITransfer[]> = new BehaviorSubject([] as ITransfer[]);
  transferDetails: BehaviorSubject<IGetTransferDetails> = new BehaviorSubject(null as any);

  async listTransfers(authProvider: MsalAuthProvider, messageHandlers: IMessageHandlers, detailsKey?: string) {
    const { showError } = messageHandlers;
    const bearerToken = detailsKey ? detailsKey : (await authProvider.getAccessToken()).accessToken;

    let transfers!: ITransfer[];

    try {
      const response = await Axios.post<IListTransfers>(
        listTransfers.endpoint,
        { region },
        this.getAuthorizationHeaders(listTransfers.key, bearerToken)
      );

      transfers = response.data.transfers;
    } catch (error) {
      showError((error.body && error.body.message) || error.message);
    }

    this.transfers.next(transfers);
  }

  async getTransferDetails(authProvider: MsalAuthProvider, containerToken: string, messageHandlers: IMessageHandlers) {
    const { showError } = messageHandlers;
    const bearerToken = !authProvider ? undefined : (await authProvider.getAccessToken()).accessToken;

    let getTransferResponse!: IGetTransferDetails;

    try {
      const response = await Axios.post<IGetTransferDetails>(
        getTransfer.endpoint,
        { region, containerToken },
        this.getAuthorizationHeaders(getTransfer.key, bearerToken)
      );

      getTransferResponse = response.data;
    } catch (error) {
      showError((error.body && error.body.message) || error.message);
    }

    this.transferDetails.next(getTransferResponse);
  }

  private getAuthorizationHeaders(key: string, bearerToken?: string) {
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
  }
}
