import { rootInjector } from 'typed-inject';

import { ITransferFilesService, TransferFilesService } from './TransferFilesService';
import { ITransfersService, TransfersService } from './TransfersService';

const dependencies = rootInjector
  .provideClass(ITransferFilesService, TransferFilesService)
  .provideClass(ITransfersService, TransfersService);

export const useDependency = dependencies.resolve.bind(dependencies);
