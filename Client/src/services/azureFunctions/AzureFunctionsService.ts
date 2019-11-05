import Axios from 'axios';
import { AuthenticationState } from 'react-aad-msal';
import { BehaviorSubject } from 'rxjs';

import { authProvider } from '../../app/authProvider';
import { IMessageContext } from '../../app/frontend/header/MessageContext';
import { getTransfer, listTransfers, updateTransfer } from '../../transfers.json';
import { ITeamsMessage, ITransfer } from './azureFunctions';

export const IAzureFunctionsService = 'IAzureFunctionsService';

export interface IAzureFunctionsService {
  transfers: BehaviorSubject<ITransfer[] | undefined>;
  transfer: BehaviorSubject<ITransfer | undefined>;
  messageContext: IMessageContext;
  listTransfers(region?: string, detailsKey?: string): Promise<void>;
  getTransfer(transferToken: string): Promise<void>;
  sendTeamsMessage(teamsMessage: ITeamsMessage): Promise<void>;
}

export class AzureFunctionsService implements IAzureFunctionsService {
  transfers: BehaviorSubject<ITransfer[] | undefined> = new BehaviorSubject<ITransfer[] | undefined>(undefined);
  transfer: BehaviorSubject<ITransfer | undefined> = new BehaviorSubject<ITransfer | undefined>(undefined);
  messageContext!: IMessageContext;

  async listTransfers(region?: string, detailsKey?: string) {
    const { showError } = this.messageContext;
    const bearerToken = detailsKey ? detailsKey : (await authProvider.getAccessToken()).accessToken;

    const specificRegion = region ? region : '';

    try {
      const response = await Axios.post<ITransfer[]>(
        `${listTransfers.endpoint}/${specificRegion}`,
        null,
        this.getAuthorizationHeaders(listTransfers.key, bearerToken)
      );

      this.transfers.next(response.data);
    } catch (error) {
      showError(error);
    }
  }

  async getTransfer(transferToken: string) {
    const { showError } = this.messageContext;

    const bearerToken =
      authProvider.authenticationState === AuthenticationState.Authenticated
        ? (await authProvider.getAccessToken()).accessToken
        : undefined;

    try {
      const response = await Axios.post<ITransfer>(
        getTransfer.endpoint,
        { transferToken },
        this.getAuthorizationHeaders(getTransfer.key, bearerToken)
      );

      if (response && response.data) {
        response.data.transferToken = transferToken;
        this.transfer.next(response.data);
      }
    } catch (error) {
      showError(error);
    }
  }

  async sendTeamsMessage(teamsMessage: ITeamsMessage): Promise<void> {
    const { showError } = this.messageContext;

    const bearerToken =
      authProvider.authenticationState === AuthenticationState.Authenticated
        ? (await authProvider.getAccessToken()).accessToken
        : undefined;

    try {
      await Axios.post(
        updateTransfer.endpoint,
        teamsMessage,
        this.getAuthorizationHeaders(updateTransfer.key, bearerToken)
      );
    } catch (error) {
      showError(error);
    }
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
