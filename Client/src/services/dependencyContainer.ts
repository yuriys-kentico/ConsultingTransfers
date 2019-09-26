import { rootInjector } from 'typed-inject';

import { AzureFunctionsService, IAzureFunctionsService } from './azureFunctions/AzureFunctionsService';
import { AzureStorageService, IAzureStorageService } from './azureStorage/AzureStorageService';

const dependencies = rootInjector
  .provideClass(IAzureStorageService, AzureStorageService)
  .provideClass(IAzureFunctionsService, AzureFunctionsService);

export const useDependency = dependencies.resolve.bind(dependencies);
