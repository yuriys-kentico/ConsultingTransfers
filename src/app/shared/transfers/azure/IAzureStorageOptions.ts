import { IShowMessageHandlers } from '../../header/AppHeaderContext';

interface IAzureStorageAppOptions {
  uploadBlockMb: number;
}

export interface IAzureStorageOptions {
  appOptions: IAzureStorageAppOptions;
  messageHandlers: IShowMessageHandlers;
}
