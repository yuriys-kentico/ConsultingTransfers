import { IRequestItem } from './RequestItem';

export interface IRequestRetrieverResponse {
  sasToken: string;
  containerName: string;
  requestItem: IRequestItem;
}
