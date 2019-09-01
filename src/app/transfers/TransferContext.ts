import { createContext } from 'react';
import { ConsultingRequest } from './kenticoCloud/ConsultingRequest';

export interface ITransferContext {
  item: ConsultingRequest;
}

export const TransferContext = createContext<ITransferContext>({} as any);
