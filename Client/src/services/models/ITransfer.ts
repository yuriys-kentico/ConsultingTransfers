import { IField } from './IField';

export interface ITransfer {
  region: string;
  name: string;
  codename?: string;
  customer: string;
  requester: string;
  containerUrl: string;
  transferToken: string;
  fields: IField[];
  template?: string;
}
