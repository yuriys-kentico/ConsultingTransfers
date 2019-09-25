import { rootInjector } from 'typed-inject';

import { AzureStorageService, IAzureStorageService } from './azureStorage/AzureStorageService';

const dependencies = rootInjector.provideClass(IAzureStorageService, AzureStorageService);

export const useDependency = dependencies.resolve.bind(dependencies);
