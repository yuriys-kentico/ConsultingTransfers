import Axios from 'axios';
import { AuthenticationState } from 'react-aad-msal';
import { BehaviorSubject } from 'rxjs';

import { authProvider } from '../../app/authProvider';
import { IMessageHandlers } from '../../app/frontend/header/MessageContext';
import { getTransfer, listTransfers, region } from '../../transfers.json';
import { IGetTransferDetails, IListTransfers, ITransfer } from './azureFunctions';

export const IAzureFunctionsService = 'IAzureFunctionsService';

export interface IAzureFunctionsService {
  transfers: BehaviorSubject<ITransfer[]>;
  transferDetails: BehaviorSubject<IGetTransferDetails>;

  listTransfers(messageHandlers: IMessageHandlers, detailsKey?: string): Promise<void>;
  getTransferDetails(containerToken: string, messageHandlers: IMessageHandlers): Promise<void>;
}

export class AzureFunctionsService implements IAzureFunctionsService {
  transfers: BehaviorSubject<ITransfer[]> = new BehaviorSubject<ITransfer[]>([]);
  transferDetails: BehaviorSubject<IGetTransferDetails> = new BehaviorSubject<IGetTransferDetails>(null as any);

  async listTransfers(messageHandlers: IMessageHandlers, detailsKey?: string) {
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
      showError(error);
    }

    this.transfers.next(transfers);
  }

  async getTransferDetails(containerToken: string, messageHandlers: IMessageHandlers) {
    const { showError } = messageHandlers;
    const bearerToken =
      authProvider.authenticationState === AuthenticationState.Authenticated
        ? (await authProvider.getAccessToken()).accessToken
        : undefined;

    let getTransferResponse!: IGetTransferDetails;

    try {
      const response = await Axios.post<IGetTransferDetails>(
        getTransfer.endpoint,
        { region, containerToken },
        this.getAuthorizationHeaders(getTransfer.key, bearerToken)
      );

      getTransferResponse = response && response.data;
    } catch (error) {
      showError(error);
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
