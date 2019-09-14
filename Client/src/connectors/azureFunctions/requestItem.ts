export interface IRequestItem {
  accountName: string;
  customUrl: string;
  fields: string;
  url: string;
  requester: string;
  system: {
    name: string;
    codename: string;
    type: string;
  };
}
