import { IFieldHolderProps } from '../../app/frontend/transfer/FieldHolder';

export interface ITransfer {
  region: string;
  name: string;
  codename: string;
  customer: string;
  requester: string;
  containerName: string;
  containerUrl: string;
  transferToken: string;
  fields: IFieldHolderProps[];
}

export interface ITeamsMessage {
  transferToken: string;
  fieldName: string;
  messageItemCodename: string;
}
