import { DeliveryClient, IDeliveryClientConfig, TypeResolver } from 'kentico-cloud-delivery';

import { ConsultingRequest } from './ConsultingRequest';
import { Field } from './Field';

export const getDeliveryClient = (config: IDeliveryClientConfig) => {
  return new DeliveryClient({
    ...config,
    typeResolvers: [
      new TypeResolver('consulting_request', () => new ConsultingRequest()),
      new TypeResolver('field', () => new Field())
    ]
  });
};
