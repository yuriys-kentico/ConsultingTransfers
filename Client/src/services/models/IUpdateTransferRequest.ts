type UpdateType = 'fieldComplete' | 'fieldIncomplete';

export interface IUpdateTransferRequest {
  transferToken: string;
  field: string;
  type: UpdateType;
  messageItemCodename?: string;
}
