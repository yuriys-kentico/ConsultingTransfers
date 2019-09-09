import { ContentManagementClient, IContentManagementClientConfig } from 'kentico-cloud-content-management';
import { DeliveryClient, IDeliveryClientConfig, TypeResolver } from 'kentico-cloud-delivery';

import { Field } from './contentTypes/Field';
import { Request } from './contentTypes/Request';

const deliveryClient = (config: IDeliveryClientConfig) => {
  return new DeliveryClient({
    ...config,
    typeResolvers: [
      new TypeResolver(Request.codename, () => new Request()),
      new TypeResolver(Field.codename, () => new Field())
    ]
  });
};

const contentManagementClient = (config: IContentManagementClientConfig) => {
  return new ContentManagementClient({ ...config });
};

export const KenticoCloud = {
  deliveryClient,
  contentManagementClient
};
