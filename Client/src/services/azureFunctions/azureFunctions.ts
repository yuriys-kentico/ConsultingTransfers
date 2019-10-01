export interface ITransfer {
  customer: string;
  requester: string;
  region: string;
  transferToken: string;
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
