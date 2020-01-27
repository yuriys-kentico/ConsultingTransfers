import { rootInjector } from 'typed-inject';

import { FieldComponentRepository, IFieldComponentRepository } from './FieldComponentRepository';
import { ITransferFilesService, TransferFilesService } from './TransferFilesService';
import { ITransfersService, TransfersService } from './TransfersService';

const dependencies = rootInjector
  .provideClass(IFieldComponentRepository, FieldComponentRepository)
  .provideClass(ITransferFilesService, TransferFilesService)
  .provideClass(ITransfersService, TransfersService);

export const useDependency = dependencies.resolve.bind(dependencies);
