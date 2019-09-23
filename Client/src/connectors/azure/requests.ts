export interface IRequestItem {
  crmAccountName: string;
  requester: string;
  containerToken: string;
  fields: string;
  system: {
    name: string;
    codename: string;
  };
}

export interface IRequestListerResponse {
  requestItems: IRequestItem[];
}

export interface IRequestRetrieverResponse {
  sasToken: string;
  containerName: string;
  requestItem: IRequestItem;
}

export const getTransferUrl = (containerToken: string) => `/transfer/${encodeURIComponent(containerToken)}`;
export const getTransfersUrl = (containerToken: string) => `/transfers/${encodeURIComponent(containerToken)}`;
