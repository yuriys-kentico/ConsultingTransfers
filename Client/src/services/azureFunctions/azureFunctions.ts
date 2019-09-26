export interface ITransfer {
  customer: string;
  requester: string;
  containerToken: string;
  fields: string;
  system: {
    name: string;
    codename: string;
  };
}

export interface IListTransfers {
  transfers: ITransfer[];
}

export interface IGetTransferDetails {
  containerUrl: string;
  containerName: string;
  transfer: ITransfer;
}

export const getTransferUrl = (containerToken: string) => `/transfer/${encodeURIComponent(containerToken)}`;
export const getTransfersUrl = (containerToken: string) => `/transfers/${encodeURIComponent(containerToken)}`;
