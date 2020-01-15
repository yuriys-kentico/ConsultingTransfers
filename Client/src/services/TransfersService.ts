import Axios from 'axios';
import { AuthenticationState } from 'react-aad-msal';
import { BehaviorSubject, Subscription, timer } from 'rxjs';

import { authProvider } from '../app/authProvider';
import { IMessageContext } from '../app/frontend/header/MessageContext';
import { experience } from '../appSettings.json';
import {
    createTransfer,
    getTransfer,
    listTransfers,
    resumeTransfer,
    suspendTransfer,
    updateTransfer
} from '../transfers.json';
import { ICreateTransferRequest } from './models/ICreateTransferRequest';
import { IGetTransferRequest } from './models/IGetTransferRequest';
import { IListTransfersRequest } from './models/IListTransfersRequest';
import { ITransfer } from './models/ITransfer';
import { IUpdateTransferRequest } from './models/IUpdateTransferRequest';

export const ITransfersService = 'ITransfersService';

export class TransfersService {
  transfers: BehaviorSubject<ITransfer[] | undefined> = new BehaviorSubject<ITransfer[] | undefined>(undefined);
  transfer: BehaviorSubject<ITransfer | undefined> = new BehaviorSubject<ITransfer | undefined>(undefined);
  messageContext!: IMessageContext;

  async listTransfers(listTransfersRequest: IListTransfersRequest) {
    const { showError } = this.messageContext;
    const { region, detailsKey } = listTransfersRequest;
    const specificRegion = region ? region : '';

    try {
      const response = await Axios.post<ITransfer[]>(
        `${listTransfers.endpoint}/${specificRegion}`,
        null,
        await this.getAuthorizationHeaders(listTransfers.key, detailsKey)
      );

      if (response.data) {
        this.transfers.next(response.data);
      }
    } catch (error) {
      showError(error);
    }
  }

  async getTransfer(getTransferRequest: IGetTransferRequest): Promise<() => void> {
    const { showError } = this.messageContext;

    getTransferRequest.containerUrl = true;
    getTransferRequest.fields = true;

    const getTransferLoop = async () => {
      const response = await Axios.post<ITransfer>(
        getTransfer.endpoint,
        getTransferRequest,
        await this.getAuthorizationHeaders(getTransfer.key)
      );

      if (response.data) {
        response.data.transferToken = getTransferRequest.transferToken;
        this.transfer.next(response.data);
      }
    };

    let subscription: Subscription;

    try {
      await getTransferLoop();

      subscription = timer(experience.transferRefreshTimeout, experience.transferRefreshTimeout).subscribe({
        next: getTransferLoop
      });
    } catch (error) {
      showError(error);
    }

    return () => subscription.unsubscribe();
  }

  async updateTransfer(updateTransferRequest: IUpdateTransferRequest): Promise<void> {
    const { showError } = this.messageContext;

    try {
      await Axios.post(
        updateTransfer.endpoint,
        updateTransferRequest,
        await this.getAuthorizationHeaders(updateTransfer.key)
      );
    } catch (error) {
      showError(error);
    }
  }

  async suspendTransfer(getTransferRequest: IGetTransferRequest) {
    const { showError } = this.messageContext;

    try {
      await Axios.post(
        suspendTransfer.endpoint,
        getTransferRequest,
        await this.getAuthorizationHeaders(suspendTransfer.key)
      );
    } catch (error) {
      showError(error);
    }
  }

  async resumeTransfer(getTransferRequest: IGetTransferRequest) {
    const { showError } = this.messageContext;

    try {
      await Axios.post(
        resumeTransfer.endpoint,
        getTransferRequest,
        await this.getAuthorizationHeaders(resumeTransfer.key)
      );
    } catch (error) {
      showError(error);
    }
  }

  async createTransfer(createTransferRequest: ICreateTransferRequest) {
    const { showError } = this.messageContext;

    try {
      const response = await Axios.post<ITransfer>(
        `${createTransfer.endpoint}/${createTransferRequest.region}`,
        createTransferRequest,
        await this.getAuthorizationHeaders(createTransfer.key)
      );

      if (response.data) {
        this.transfer.next(response.data);
      }
    } catch (error) {
      showError(error);
    }
  }

  private async getAuthorizationHeaders(key: string, detailsKey?: string) {
    let bearerToken = detailsKey;

    if (authProvider.authenticationState === AuthenticationState.Authenticated) {
      bearerToken = (await authProvider.getAccessToken()).accessToken;
    }

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
