import { IRequestItem } from './IRequestItem';

export interface IRequestRetrieverResponse {
  sasToken: string;
  containerName: string;
  requestItem: IRequestItem;
}
