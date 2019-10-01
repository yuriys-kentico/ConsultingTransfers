import Axios from 'axios';
import { AuthenticationState } from 'react-aad-msal';
import { BehaviorSubject } from 'rxjs';

import { authProvider } from '../../app/authProvider';
import { IMessageContext } from '../../app/frontend/header/MessageContext';
import { getTransfer, listTransfers } from '../../transfers.json';
import { IGetTransferDetails, IListTransfers, ITransfer } from './azureFunctions';

export const IAzureFunctionsService = 'IAzureFunctionsService';

export interface IAzureFunctionsService {
  transfers: BehaviorSubject<ITransfer[] | undefined>;
  transferDetails: BehaviorSubject<IGetTransferDetails | undefined>;
  messageContext: IMessageContext;
  listTransfers(region?: string, detailsKey?: string): Promise<void>;
  getTransferDetails(transferToken: string): Promise<void>;
}

export class AzureFunctionsService implements IAzureFunctionsService {
  transfers: BehaviorSubject<ITransfer[] | undefined> = new BehaviorSubject<ITransfer[] | undefined>(undefined);
  transferDetails: BehaviorSubject<IGetTransferDetails | undefined> = new BehaviorSubject<
    IGetTransferDetails | undefined
  >(undefined);
  messageContext!: IMessageContext;

  async listTransfers(region?: string, detailsKey?: string) {
    const { showError } = this.messageContext;
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

  async getTransferDetails(transferToken: string) {
    const { showError } = this.messageContext;
    const bearerToken =
      authProvider.authenticationState === AuthenticationState.Authenticated
        ? (await authProvider.getAccessToken()).accessToken
        : undefined;

    let getTransferResponse!: IGetTransferDetails;

    try {
      const response = await Axios.post<IGetTransferDetails>(
        getTransfer.endpoint,
        { transferToken },
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
