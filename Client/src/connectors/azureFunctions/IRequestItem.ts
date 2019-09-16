export interface IRequestItem {
  accountName: string;
  requester: string;
  containerToken: string;
  fields: string;
  system: {
    name: string;
    codename: string;
  };
}
