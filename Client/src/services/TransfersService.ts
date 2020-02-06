import Axios from 'axios';
import { AuthenticationState } from 'react-aad-msal';
import { BehaviorSubject, Subscription, timer } from 'rxjs';

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
import { authProvider } from './authProvider';
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
    const { region } = listTransfersRequest;
    const specificRegion = region ? region : '';

    try {
      const response = await this.post<ITransfer[]>(
        { endpoint: `${listTransfers.endpoint}/${specificRegion}`, key: listTransfers.key },
        null
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
      const response = await this.post<ITransfer>(getTransfer, getTransferRequest);

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
      await this.post(updateTransfer, updateTransferRequest);
    } catch (error) {
      showError(error);
    }
  }

  async suspendTransfer(getTransferRequest: IGetTransferRequest) {
    const { showError } = this.messageContext;

    try {
      await this.post(suspendTransfer, getTransferRequest);
    } catch (error) {
      showError(error);
    }
  }

  async resumeTransfer(getTransferRequest: IGetTransferRequest) {
    const { showError } = this.messageContext;

    try {
      await this.post(resumeTransfer, getTransferRequest);
    } catch (error) {
      showError(error);
    }
  }

  async createTransfer(createTransferRequest: ICreateTransferRequest) {
    const { showError } = this.messageContext;

    try {
      const response = await this.post<ITransfer>(
        { endpoint: `${createTransfer.endpoint}/${createTransferRequest.region}`, key: createTransfer.key },
        createTransferRequest
      );

      if (response.data) {
        this.transfer.next(response.data);
      }
    } catch (error) {
      showError(error);
    }
  }

  private async post<T>(endpoint: { endpoint: string; key: string }, body: any) {
    return await Axios.post<T>(
      `${process.env.REACT_APP_BackendHost}${endpoint.endpoint}`,
      body,
      await this.getAuthorizationHeaders(endpoint.key)
    );
  }

  private async getAuthorizationHeaders(key: string) {
    let bearerToken;

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
